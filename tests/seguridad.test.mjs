/**
 * Pruebas del nucleo de seguridad: validacion del secreto, tokens de sesion y
 * comprobantes de restablecimiento de contrasena.
 *
 * Se ejecutan contra los modulos compilados en .test-build (ver
 * `npm run test:seguridad`), porque son TypeScript y node los necesita en JS.
 *
 * No tocan la base de datos: todo lo que se prueba aqui es criptografia y
 * validacion pura.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

const SECRETO_VALIDO = 'x'.repeat(64);

// JWT_EXPIRES_IN se lee al cargar el modulo, asi que se fija antes de importar.
process.env.JWT_EXPIRES_IN = '12h';
process.env.JWT_SECRET = SECRETO_VALIDO;

const { getJwtSecret, generateToken, verifyToken } = await import(
  '../.test-build/lib/utils/security.js'
);
const { emitirResetTicket, verificarResetTicket } = await import(
  '../.test-build/lib/utils/reset-ticket.js'
);

/** Repite la derivacion de clave del modulo, para forjar comprobantes. */
function claveDeTicket(secreto) {
  return crypto.createHmac('sha256', secreto).update('password_reset').digest('hex');
}

function conSecreto(valor, fn) {
  const previo = process.env.JWT_SECRET;
  if (valor === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = valor;
  }
  try {
    return fn();
  } finally {
    process.env.JWT_SECRET = previo;
  }
}

// ============================================================
test('getJwtSecret rechaza un secreto ausente', () => {
  conSecreto(undefined, () => {
    assert.throws(() => getJwtSecret());
  });
});

test('getJwtSecret rechaza los valores de ejemplo publicos', () => {
  for (const malo of [
    'tu-secreto-super-seguro-cambiar-en-produccion',
    'clave-secreta-de-produccion-cambiar',
    'build_dummy_jwt_secret_key',
  ]) {
    conSecreto(malo, () => {
      assert.throws(() => getJwtSecret(), undefined, `deberia rechazar: ${malo}`);
    });
  }
});

test('getJwtSecret rechaza un secreto de menos de 32 caracteres', () => {
  conSecreto('a'.repeat(31), () => {
    assert.throws(() => getJwtSecret());
  });
});

test('getJwtSecret acepta un secreto valido', () => {
  conSecreto(SECRETO_VALIDO, () => {
    assert.equal(getJwtSecret(), SECRETO_VALIDO);
  });
});

// ============================================================
test('un token de sesion valido se verifica y conserva sus datos', async () => {
  const token = generateToken('V12345678', 'Coordinador');
  const datos = await verifyToken(token);
  assert.equal(datos.cedula, 'V12345678');
  assert.equal(datos.rol, 'Coordinador');
});

test('un token firmado con otro secreto es rechazado', async () => {
  const ajeno = jwt.sign({ cedula: 'V1', rol: 'Coordinador' }, 'o'.repeat(64), {
    algorithm: 'HS256',
  });
  await assert.rejects(() => verifyToken(ajeno));
});

test('un token con alg=none es rechazado', async () => {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({ cedula: 'V1', rol: 'Coordinador' })
  ).toString('base64url');
  await assert.rejects(() => verifyToken(`${header}.${payload}.`));
});

test('un token vencido es rechazado', async () => {
  const vencido = jwt.sign({ cedula: 'V1', rol: 'Coordinador' }, SECRETO_VALIDO, {
    algorithm: 'HS256',
    expiresIn: '-1s',
  });
  await assert.rejects(() => verifyToken(vencido));
});

// ============================================================
test('un comprobante de reseteo recien emitido se verifica', () => {
  const ticket = emitirResetTicket({ cedula: 'V12345678', idToken: 42 });
  const datos = verificarResetTicket(ticket);
  assert.deepEqual(datos, { cedula: 'V12345678', idToken: 42 });
});

test('un token de sesion NO sirve como comprobante de reseteo', () => {
  // Es el punto de la clave derivada: aunque un atacante tenga una sesion
  // valida, eso no lo habilita a cambiar contrasenas ajenas.
  const sesion = generateToken('V12345678', 'Coordinador');
  assert.equal(verificarResetTicket(sesion), null);
});

test('un comprobante de reseteo NO sirve como token de sesion', async () => {
  const ticket = emitirResetTicket({ cedula: 'V12345678', idToken: 42 });
  await assert.rejects(() => verifyToken(ticket));
});

test('un comprobante manipulado es rechazado', () => {
  const ticket = emitirResetTicket({ cedula: 'V12345678', idToken: 42 });
  const [h, p, s] = ticket.split('.');
  const otroPayload = Buffer.from(
    JSON.stringify({ sub: 'V99999999', jti: '42', proposito: 'password_reset' })
  ).toString('base64url');
  assert.equal(verificarResetTicket(`${h}.${otroPayload}.${s}`), null);
});

test('un comprobante vencido es rechazado', () => {
  const vencido = jwt.sign(
    { sub: 'V12345678', jti: '42', proposito: 'password_reset' },
    claveDeTicket(SECRETO_VALIDO),
    { algorithm: 'HS256', expiresIn: '-1s' }
  );
  assert.equal(verificarResetTicket(vencido), null);
});

test('un comprobante con proposito distinto es rechazado', () => {
  // Bien firmado con la clave derivada, pero para otra cosa.
  const otroProposito = jwt.sign(
    { sub: 'V12345678', jti: '42', proposito: 'otra_cosa' },
    claveDeTicket(SECRETO_VALIDO),
    { algorithm: 'HS256', expiresIn: '15m' }
  );
  assert.equal(verificarResetTicket(otroProposito), null);
});

test('un comprobante vacio o malformado es rechazado', () => {
  assert.equal(verificarResetTicket(''), null);
  assert.equal(verificarResetTicket('no-es-un-jwt'), null);
});

// --- Puerta de la app de escritorio ---
//
// No es criptografia, pero decide quien recibe un 404 y quien la aplicacion,
// asi que se prueba igual: un fallo aqui deja el despliegue abierto o, peor,
// deja fuera a la clinica entera.

const { comparaEnTiempoConstante, obtenerTokenEscritorio, userAgentAutorizado } = await import(
  '../.test-build/lib/utils/desktop-gate.js'
);

const TOKEN_ESCRITORIO = 'a'.repeat(32);

/** User-Agent tal como lo arma desktop/src-tauri/src/lib.rs. */
function agenteDeEscritorio(token, version = '0.1.0') {
  return (
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ' +
    `Chrome/131.0.0.0 Safari/537.36 ClinicaJuridicaDesktop/${version} (${token})`
  );
}

function conTokenEscritorio(valor, fn) {
  const previo = process.env.DESKTOP_APP_TOKEN;
  if (valor === undefined) {
    delete process.env.DESKTOP_APP_TOKEN;
  } else {
    process.env.DESKTOP_APP_TOKEN = valor;
  }
  try {
    fn();
  } finally {
    if (previo === undefined) {
      delete process.env.DESKTOP_APP_TOKEN;
    } else {
      process.env.DESKTOP_APP_TOKEN = previo;
    }
  }
}

test('sin token configurado la puerta queda abierta', () => {
  conTokenEscritorio(undefined, () => {
    assert.equal(obtenerTokenEscritorio(), null);
  });
});

test('un token demasiado corto no cuenta como configurado', () => {
  // Un valor de relleno olvidado en el panel no debe parecer una puerta puesta.
  conTokenEscritorio('corto', () => {
    assert.equal(obtenerTokenEscritorio(), null);
  });
});

test('un token valido se lee sin espacios alrededor', () => {
  conTokenEscritorio(`  ${TOKEN_ESCRITORIO}  `, () => {
    assert.equal(obtenerTokenEscritorio(), TOKEN_ESCRITORIO);
  });
});

test('el User-Agent de la app de escritorio pasa la puerta', () => {
  assert.equal(userAgentAutorizado(agenteDeEscritorio(TOKEN_ESCRITORIO), TOKEN_ESCRITORIO), true);
});

test('la puerta sigue abierta cuando sube la version de la app', () => {
  assert.equal(
    userAgentAutorizado(agenteDeEscritorio(TOKEN_ESCRITORIO, '1.4.12'), TOKEN_ESCRITORIO),
    true
  );
});

test('un navegador normal no pasa la puerta', () => {
  const chrome =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
  assert.equal(userAgentAutorizado(chrome, TOKEN_ESCRITORIO), false);
  assert.equal(userAgentAutorizado(null, TOKEN_ESCRITORIO), false);
  assert.equal(userAgentAutorizado('', TOKEN_ESCRITORIO), false);
});

test('el marcador correcto con otro token no pasa la puerta', () => {
  assert.equal(userAgentAutorizado(agenteDeEscritorio('b'.repeat(32)), TOKEN_ESCRITORIO), false);
  assert.equal(userAgentAutorizado(agenteDeEscritorio(''), TOKEN_ESCRITORIO), false);
});

test('el token no se acepta por prefijo ni por parecido', () => {
  assert.equal(comparaEnTiempoConstante(TOKEN_ESCRITORIO, TOKEN_ESCRITORIO), true);
  assert.equal(comparaEnTiempoConstante('a'.repeat(31), TOKEN_ESCRITORIO), false);
  assert.equal(comparaEnTiempoConstante('a'.repeat(33), TOKEN_ESCRITORIO), false);
  assert.equal(comparaEnTiempoConstante('', TOKEN_ESCRITORIO), false);
});

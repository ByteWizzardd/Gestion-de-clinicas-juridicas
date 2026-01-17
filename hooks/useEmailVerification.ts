import { useState, useCallback } from 'react';
import { verifyEmailExistsAction } from '@/app/actions/email-verification.actions';

interface EmailVerificationState {
    isVerifying: boolean;
    isValid: boolean | null;
    error: string | null;
    reason: string | null;
}

export function useEmailVerification() {
    const [state, setState] = useState<EmailVerificationState>({
        isVerifying: false,
        isValid: null,
        error: null,
        reason: null,
    });

    const verifyEmail = useCallback(async (email: string): Promise<boolean> => {
        if (!email || email.trim() === '') {
            setState({
                isVerifying: false,
                isValid: null,
                error: null,
                reason: null,
            });
            return false;
        }

        setState(prev => ({ ...prev, isVerifying: true }));

        try {
            const result = await verifyEmailExistsAction(email);

            setState({
                isVerifying: false,
                isValid: result.isValid,
                error: result.error || null,
                reason: result.reason || null,
            });

            return result.isValid;
        } catch (error) {
            console.error('Error verificando email:', error);
            setState({
                isVerifying: false,
                isValid: false,
                error: 'Error de verificación',
                reason: 'Ocurrió un error al verificar el email',
            });
            return false;
        }
    }, []);

    const resetVerification = useCallback(() => {
        setState({
            isVerifying: false,
            isValid: null,
            error: null,
            reason: null,
        });
    }, []);

    return {
        ...state,
        verifyEmail,
        resetVerification,
    };
}

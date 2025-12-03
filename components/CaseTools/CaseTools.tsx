import Add from "./Add";
import Filter from "./Filter";
import Search from "./search";

type CaseToolsProps = {
  addLabel?: string;
};

function CaseTools({ addLabel }: CaseToolsProps) {
    return (
        <div className="flex flex-nowrap gap-3 sm:gap-4 items-center w-full px-3">
            <div className="flex-1 min-w-0">
                <Search/>
            </div>
            <div className="flex gap-3 sm:gap-4 items-center flex-shrink-0">
                <Filter/>
            <Add label={addLabel} />
            </div>
        </div>
    );
}

export default CaseTools;
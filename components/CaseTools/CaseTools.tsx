import Add from "./Add";
import Filter from "./Filter";
import Search from "./search";

type CaseToolsProps = {
  addLabel?: string;
};

function CaseTools({ addLabel }: CaseToolsProps) {
    return (
        <div className="flex flex-nowrap gap-4 items-center w-full">
            <div className="flex-1 ml-10">
                <Search/>
            </div>
            <div className="mr-7">
                <Filter/>
            </div>
            <Add label={addLabel} />
        </div>
    );
}

export default CaseTools;
export function IconButton({
    icon,
    onClick,
    activated=false,
}: {
    icon: React.ReactNode;
    onClick: () => void;
    activated?: boolean;
}) {
    return (
        <div
        className={`cursor-pointer rounded-xl transition-all ${
            activated
                ? "text-white bg-sky-800 p-3 -m-1"
                : "text-gray-300 p-2 hover:bg-gray-700/75 hover:p-3 hover:-m-1"
        }`}
            onClick={onClick}
        >
            {icon}
        </div>
    );
}

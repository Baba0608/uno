interface ButtonProps {
  value: string;
  onClick?: () => void;
  disabled?: boolean;
}

export default function Button(props: ButtonProps) {
  const { value, onClick, disabled = false } = props;

  return (
    <>
      <button
        className="bg-red-600 text-2xl rounded-2xl p-4 w-80 h-16 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onClick}
        disabled={disabled}
      >
        {value}
      </button>
    </>
  );
}

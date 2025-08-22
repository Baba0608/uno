interface ButtonProps {
  value: string;
  onClick?: () => void;
}

export default function Button(props: ButtonProps) {
  const { value, onClick } = props;

  return (
    <>
      <button
        className="bg-red-600 text-2xl rounded-2xl p-4 w-80 h-16"
        onClick={onClick}
      >
        {value}
      </button>
    </>
  );
}

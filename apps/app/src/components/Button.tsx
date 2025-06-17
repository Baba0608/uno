export default function Button(props: any) {
  const { value } = props;

  return (
    <>
      <button className="bg-red-600 text-2xl rounded-2xl p-4 w-80 h-16">
        {value}
      </button>
    </>
  );
}

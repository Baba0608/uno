export default function Error({ error }: { error: string }) {
  return (
    <div className="w-screen h-screen bg-blue-900 flex flex-col justify-center items-center gap-5">
      <div className="bg-red-500 text-white p-4 rounded-lg max-w-md text-center min-w-96">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-white text-red-500 px-4 py-2 rounded hover:bg-gray-100"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

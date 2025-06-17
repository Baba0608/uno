import Image from 'next/image';

import Button from '../components/Button';
import { Input } from 'postcss';

export default function Index() {
  return (
    <div className="w-screen h-screen bg-blue-900 flex flex-col justify-center items-center gap-5">
      <div>
        <Image src="/logo.png" alt="Logo" width={300} height={300} />
      </div>
      <Button value="CREATE ROOM" />
      <Button value="JOIN ROOM" />
      <div className="flex flex-col items-center gap-2">
        <p className="text-2xl text-white">Room Code</p>
        <input
          type="text"
          className="text-xl bg-blue-700 px-3 py-2 text-white w-80 rounded-xl focus:outline-none"
        />
      </div>
    </div>
  );
}

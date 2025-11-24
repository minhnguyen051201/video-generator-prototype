import { ArrowRightToLine } from "lucide-react";
import Link from "next/link";

const Header = () => {
  return (
    <div className="w-full h-[80px] flex justify-around font-medium ">
      {/* navigation */}
      <div className="w-full h-full flex justify-center items-center gap-8">
        <button>Community</button>
        <button>Pricing</button>
        <button>Resources</button>
        <button>About Us</button>
      </div>

      {/* buttons function */}
      <div className="flex w-full h-full items-center justify-center gap-12 ">
        <div className="flex w-fit h-full items-center justify-center gap-6">
          <Link
            href={`/sign-up`}
            className="rounded-2xl px-6 py-2 bg-[#C66B3D] shadow-xl"
          >
            SignUp
          </Link>
          <Link
            href={`/log-in`}
            className="rounded-2xl px-6 py-2 bg-[#C66B3D] shadow-xl"
          >
            Login
          </Link>
        </div>
        <div className="flex w-fit h-full items-center justify-center gap-4  text-[#3C2E25]">
          <Link
            href={`/sign-in`}
            className="flex rounded-2xl px-6 py-2 gap-2 bg-[#D5A253] shadow-xl"
          >
            Start creating <ArrowRightToLine />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;

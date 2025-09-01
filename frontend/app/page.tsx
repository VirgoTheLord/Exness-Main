import Link from "next/link";

export default function Home() {
  return (
    <div className="w-screen">
      <h1>Exness</h1>
      <Link href={"/signup"}>Signup</Link>
      <Link href={"/login"}>Login</Link>
    </div>
  );
}

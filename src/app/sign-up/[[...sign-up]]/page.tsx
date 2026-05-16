import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-56px)] bg-[#f8f9fa] py-12">
      <SignUp />
    </div>
  );
}

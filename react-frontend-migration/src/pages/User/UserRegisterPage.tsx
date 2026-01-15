import { Card, CardContent, CardTitle, Button, Input } from '@/components/ui';

export default function UserRegisterPage(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent>
          <CardTitle>Register</CardTitle>
          <p className="mt-2 text-gray-600">Create an account to list and manage properties.</p>
          <form className="mt-4 space-y-4">
            <Input label="Full Name" type="text" placeholder="Enter your full name" />
            <Input label="Email" type="email" placeholder="Enter your email" />
            <Input label="Password" type="password" placeholder="Create a password" />
            <Input label="Confirm Password" type="password" placeholder="Confirm your password" />
            <Button fullWidth>Register</Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/user/signin" className="text-blue-600 hover:underline">
              Sign In
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

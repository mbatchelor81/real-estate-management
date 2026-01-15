import { Card, CardContent, CardTitle, Button, Input } from '@/components/ui';

export default function UserSignInPage(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent>
          <CardTitle>Sign In</CardTitle>
          <p className="mt-2 text-gray-600">Sign in to your account to manage properties.</p>
          <form className="mt-4 space-y-4">
            <Input label="Email" type="email" placeholder="Enter your email" />
            <Input label="Password" type="password" placeholder="Enter your password" />
            <Button fullWidth>Sign In</Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <a href="/user/register" className="text-blue-600 hover:underline">
              Register
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

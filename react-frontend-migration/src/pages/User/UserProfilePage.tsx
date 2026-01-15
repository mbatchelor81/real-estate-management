import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { User as UserIcon, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui';
import { useAppSelector } from '@/store/hooks';
import { useUserService } from '@/services/useUserService';
import { ProfileVerified, ActivityTimeline, UserProperties } from './components';

type TabType = 'activities' | 'properties';

export default function UserProfilePage(): React.ReactElement {
  const user = useAppSelector((state) => state.auth.user);
  const { updateUser, isLoading } = useUserService();

  const [activeTab, setActiveTab] = useState<TabType>('activities');
  const [imgUrl, setImgUrl] = useState<string>('./assets/images/avatar.png');
  const [formData, setFormData] = useState({
    fullName: user?.fullName ?? '',
    about: user?.about ?? '',
    address: user?.address ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageUpload = (): void => {
    const input = document.getElementById('image-upload') as HTMLInputElement | null;
    if (input) {
      input.click();
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev): void => {
        const result = ev.target?.result;
        if (typeof result === 'string') {
          setImgUrl(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName || formData.fullName.length < 4) {
      newErrors.fullName = 'Full Name must be at least 4 characters.';
    }

    if (formData.about && formData.about.length > 1000) {
      newErrors.about = 'Maximum character limit of 1000 has been reached.';
    }

    if (formData.address && formData.address.length > 1000) {
      newErrors.address = 'Maximum character limit of 1000 has been reached.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSubmitMessage(null);

    if (!validateForm()) {
      return;
    }

    const response = await updateUser(formData);
    if (response.success) {
      setSubmitMessage({ type: 'success', text: response.message ?? 'Profile updated successfully!' });
    } else {
      setSubmitMessage({ type: 'error', text: response.message ?? 'Failed to update profile.' });
    }

    setTimeout(() => setSubmitMessage(null), 5000);
  };

  const toggleTab = (): void => {
    setActiveTab((prev) => (prev === 'activities' ? 'properties' : 'activities'));
  };

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent>
            <p className="text-center text-gray-600">Please sign in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-4">
          <Card className="h-full border border-slate-200 shadow-none dark:border-slate-800">
            <CardHeader className="p-0">
              <div className="p-4" />
              <div className="flex justify-center pb-4">
                <img
                  src={imgUrl}
                  alt="Profile"
                  className="h-32 w-32 rounded-full object-cover"
                />
              </div>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                onChange={handleFileSelect}
                accept="image/*"
                hidden
                id="image-upload"
              />
              <Button
                variant="primary"
                fullWidth
                onClick={handleImageUpload}
                className="h-[50px]"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>

              <ProfileVerified />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-8">
          <Card className="h-full border border-slate-200 shadow-none dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between bg-blue-600 px-4 py-3 xl:px-6 xl:py-4">
              <CardTitle className="text-base text-white md:text-lg xl:text-xl">
                My Information
              </CardTitle>
              <UserIcon className="h-8 w-8 text-white" />
            </CardHeader>

            <CardContent className="pt-4">
              <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-5">
                <Input
                  label="Email *"
                  type="email"
                  value={user.email}
                  disabled
                  className="text-lg"
                />

                <Input
                  label="Full Name *"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  error={errors.fullName}
                  className="text-lg"
                />

                <div className="w-full">
                  <label
                    htmlFor="about"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    About Me:
                  </label>
                  <textarea
                    id="about"
                    name="about"
                    value={formData.about}
                    onChange={handleInputChange}
                    placeholder="..."
                    rows={4}
                    className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                      errors.about
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                  />
                  {errors.about && (
                    <p className="mt-1 text-sm text-red-600">{errors.about}</p>
                  )}
                </div>

                <Input
                  label="Address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  error={errors.address}
                  className="text-lg"
                />

                <div className="border-t pt-4">
                  <Link
                    to="/user/change-password"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Change Password
                  </Link>
                </div>

                {submitMessage && (
                  <div
                    className={`rounded-md p-3 ${
                      submitMessage.type === 'success'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {submitMessage.text}
                  </div>
                )}

                <div className="py-3 text-right">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    className="h-[50px] w-[200px]"
                  >
                    SAVE CHANGES
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <Card className="border border-slate-200 shadow-none dark:border-slate-800">
          <CardHeader>
            <div className="flex flex-row items-center gap-x-[2px] border-b-2 border-blue-200">
              <Button
                variant={activeTab === 'activities' ? 'primary' : 'ghost'}
                onClick={toggleTab}
                className="m-0 h-[40px] w-[180px] rounded-b-none border-b-0 lg:h-[50px] lg:w-[200px]"
              >
                My Activities
              </Button>
              <Button
                variant={activeTab === 'properties' ? 'primary' : 'ghost'}
                onClick={toggleTab}
                className="m-0 h-[40px] w-[180px] rounded-b-none border-b-0 lg:h-[50px] lg:w-[200px]"
              >
                My Properties
              </Button>
            </div>
          </CardHeader>

          <CardContent className="min-h-[400px] pt-6">
            {activeTab === 'activities' ? <ActivityTimeline /> : <UserProperties />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle, Button } from '@/components/ui';
import { Footer, ContactForm } from '@/components/shared';
import aboutMapImage from '@/assets/images/about/about-map.svg';
import aboutConnectionImage from '@/assets/images/about/about-connection.svg';
import aboutBuyImage from '@/assets/images/about/about-buy.svg';
import aboutSellImage from '@/assets/images/about/about-sell.svg';
import aboutBgContactImage from '@/assets/images/about/about-bg-contact.svg';

export default function AboutPage(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="px-3 py-4 xl:px-4">
          <h1 className="text-[16px] font-medium md:text-[18px]">About Page</h1>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-[1600px] px-3 lg:px-5">
          <div className="grid grid-cols-1">
            <div className="col-span-1">
              <Card className="mb-16 mt-4 border-0 p-4 shadow-none">
                <CardHeader className="border-0 p-0">
                  <CardTitle className="text-[24px] font-bold lg:text-[28px] xl:text-[34px]">
                    Application
                  </CardTitle>
                </CardHeader>
                <div className="my-4 h-[6px] w-[250px] rounded bg-blue-600" />
                <CardContent className="p-0">
                  <p className="font-light text-gray-800 md:text-[16px]">
                    A online property management solution for real estate and physical property
                    management. This can include residential, commercial, and land real estate. a
                    software developed to connect property managers and potential buyers.
                  </p>
                  <p className="mt-4 font-light text-gray-800 md:text-[16px]">
                    Whether you operate 1 to 100 properties this app will help you advertise, manage
                    and sell your properties to potential buyers.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="flex items-center justify-center">
              <img src={aboutMapImage} alt="map image" className="max-w-full" />
            </div>
            <div>
              <Card className="mb-32 border-0 p-4 shadow-none">
                <CardHeader className="border-0 p-0">
                  <CardTitle className="text-[24px] font-bold lg:text-[28px] xl:text-[34px]">
                    MAP VIEW
                  </CardTitle>
                </CardHeader>
                <div className="my-4 h-[6px] w-[250px] rounded bg-blue-600" />
                <CardContent className="p-0 pb-4">
                  <p className="font-light text-gray-800 md:text-[16px]">
                    Maps can be a useful tool for viewing properties location & filter them by
                    types. this also help us to know distances so that we know how far away one
                    thing is from another.
                  </p>
                  <p className="mt-4 font-light text-gray-800 md:text-[16px]">
                    You might not necessarily want to find the fastest route from property A to
                    property B, you might want to take the scenic route. Knowing how to spot
                    mountains, lakes, coastline and historic sites on a map helps you to plan which
                    property to visit.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div
          className="my-[52px] flex justify-center py-[100px]"
          style={{
            backgroundImage: `url(${aboutBgContactImage})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        >
          <Link to="/user/register">
            <Button
              variant="primary"
              size="lg"
              className="bg-green-600 px-8 py-4 text-lg font-semibold hover:bg-green-700"
            >
              TRY US NOW
            </Button>
          </Link>
        </div>

        <div className="mx-auto max-w-[1600px] px-3 pt-8 lg:px-5">
          <div className="grid grid-cols-1">
            <div className="col-span-1">
              <Card className="mb-24 border-0 p-4 shadow-none">
                <CardHeader className="border-0 p-0">
                  <CardTitle className="text-[24px] font-bold lg:text-[28px] xl:text-[34px]">
                    PROPERTIES
                  </CardTitle>
                </CardHeader>
                <div className="my-4 h-[6px] w-[250px] rounded bg-blue-600" />
                <CardContent className="p-0 pb-4">
                  <div className="text-[16px] font-light lg:text-[18px]">
                    <p className="text-[18px] font-semibold text-gray-800">
                      Do you spend way too much time looking for a Real Estate Property to buy?
                    </p>
                    <p className="mt-2 text-gray-800 md:text-[16px]">
                      dont worry we have you covered, We have hundreds of high quality properties
                      ready to sell. you can use the search field to find properties and to see
                      basic information(price, address, types, etc...) about the desired property.
                    </p>
                  </div>
                  <div className="mt-4">
                    <p className="text-[18px] font-semibold text-gray-800">
                      Do you own a property you wanted to sell?
                    </p>
                    <p className="mt-2 text-gray-800 md:text-[16px]">
                      Our application will help advertise your property to potential buyers.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-1 lg:grid-cols-3">
            <div className="p-1">
              <Card className="border border-gray-200 shadow-none">
                <CardHeader className="border-0">
                  <CardTitle className="px-3 py-3 text-[18px] md:px-4">
                    <span className="text-[32px] font-bold text-blue-600">Connect</span> with people
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex h-[300px] items-center justify-center">
                  <img src={aboutConnectionImage} alt="connection" className="max-h-full" />
                </CardContent>
              </Card>
            </div>
            <div className="p-1">
              <Card className="border border-gray-200 shadow-none">
                <CardHeader className="border-0">
                  <CardTitle className="px-3 py-3 text-[18px] md:px-4">
                    <span className="text-[32px] font-bold text-blue-600">Buy</span> new properties
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex h-[300px] items-center justify-center">
                  <img src={aboutBuyImage} alt="buy" className="max-h-full" />
                </CardContent>
              </Card>
            </div>
            <div className="p-1">
              <Card className="border border-gray-200 shadow-none">
                <CardHeader className="border-0">
                  <CardTitle className="px-3 py-3 text-[18px] md:px-4">
                    <span className="text-[32px] font-bold text-blue-600">Sell</span> your
                    properties
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex h-[300px] items-center justify-center">
                  <img src={aboutSellImage} alt="sell" className="max-h-full" />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="h-[100px]" />
        </div>

        <div
          className="py-4"
          style={{
            backgroundImage: `url(${aboutBgContactImage})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'left',
          }}
        >
          <div className="mx-auto grid max-w-screen-2xl grid-cols-1 py-3 lg:grid-cols-12 lg:py-5">
            <div className="col-span-1 flex flex-col items-center justify-center lg:col-span-5 xl:col-span-6">
              <h2 className="text-[32px] font-bold text-white">Let&apos;s get in touch</h2>
              <p className="text-2xl tracking-wide text-gray-300">
                Have an inquiry or some feedback for us?
              </p>
            </div>
            <div className="col-span-1 px-3 lg:col-span-7 lg:px-6 xl:col-span-6">
              <ContactForm />
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}

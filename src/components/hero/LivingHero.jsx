import { Link } from 'react-router-dom';

const LivingHero = () => {
  return (
    <section className="bg-white text-gray-900 py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          <div className="text-left">
            <p className="text-lg text-[#714B67] mb-3 font-medium">
              Generas Kagiraneza
            </p>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-semibold mb-6 leading-tight">
              Turn Your Ideas<br />Into <span className="text-[#714B67]">Revenue</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
              Full-Stack Developer & Trader helping businesses grow with battle-tested solutions.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <Link
                to="/hire-me"
                className="bg-[#714B67] text-white px-6 py-3 text-lg font-medium rounded-lg hover:bg-[#5a3a52] transition-colors duration-200"
              >
                Start Project
              </Link>
              <Link
                to="/service"
                className="bg-white text-gray-900 px-6 py-3 text-lg font-medium border border-gray-300 rounded-lg hover:border-gray-400 transition-colors duration-200"
              >
                Get Mentorship
              </Link>
            </div>

            <div className="flex items-center gap-8 text-lg text-gray-600">
              <span>Quality</span>
              <span>100+ Clients</span>
              <span>Proven Results</span>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <div className="relative">
              <div className="w-72 h-72 md:w-96 md:h-96 overflow-hidden border border-gray-200 shadow-sm relative rounded-lg">
                <img
                  src="/images/generas-profile.jpg"
                  alt="Generas Kagiraneza"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-full items-center justify-center text-gray-400">
                  <span className="text-5xl font-semibold">GK</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LivingHero;

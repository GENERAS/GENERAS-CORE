import { Link } from 'react-router-dom';
import { Shield, Users, Star } from 'lucide-react';

const LivingHero = () => {
  return (
    <section className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
      <div className="relative container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Turn Your Ideas <span className="text-yellow-400">Into Revenue</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8">
            Full-Stack Developer & Trader helping businesses grow with battle-tested solutions.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Shield className="w-5 h-5 text-yellow-400" />
              <span>Quality Guaranteed</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Users className="w-5 h-5 text-yellow-400" />
              <span>100+ Clients</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span>Proven Results</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/hire-me"
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-8 py-3 text-lg font-semibold rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Start Project
            </Link>
            <Link
              to="/service"
              className="bg-white/10 backdrop-blur-sm text-white px-8 py-3 text-lg font-semibold border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              Get Mentorship
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
};

export default LivingHero;

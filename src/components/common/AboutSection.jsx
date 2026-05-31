import { Link } from 'react-router-dom';

const AboutSection = () => {
  const skills = [
    { label: 'Full-Stack Development', desc: 'React, Node.js, Blockchain' },
    { label: 'Trading Expert', desc: 'Crypto, Forex, Risk Management' },
    { label: 'Continuous Learner', desc: 'From Nursery to PhD Journey' },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          <div className="relative order-2 md:order-1">
            <div className="overflow-hidden border border-gray-200 shadow-sm aspect-[4/5] relative rounded-lg">
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

          <div className="order-1 md:order-2">
            <p className="text-lg text-[#714B67] mb-3 font-medium">
              About Me
            </p>
            <h2 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-4 leading-tight">
              Building Solutions That Matter
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              I'm Generas Kagiraneza, a Full-Stack Developer and Trader from Rwanda. 
              I help businesses turn ideas into revenue through high-converting web apps 
              and proven trading strategies. My journey from Nursery School to mastering 
              code and markets taught me one thing: results speak louder than words.
            </p>

            <div className="space-y-4 mb-8">
              {skills.map((skill, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#714B67] rounded-lg flex items-center justify-center shrink-0 text-white text-lg font-medium">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium mb-1 text-lg">{skill.label}</h3>
                    <p className="text-gray-600 text-lg">{skill.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/academic"
              className="inline-flex items-center gap-2 text-[#714B67] hover:text-[#5a3a52] text-lg font-medium transition-colors duration-200"
            >
              See My Full Journey →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

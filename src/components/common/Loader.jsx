const Loader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-950">
    <div className="relative w-16 h-16">
      
      {/* Main Spinner */}
      <div className="w-16 h-16 rounded-full border-8 border-gray-700 
                  border-t-[#F9B02A] 
                  border-r-[#d1a148f6] 
                  border-b-[#C0C0C0] 
                  border-l-[#c1d8e6f1]
                  animate-spin"
           style={{ animationDuration: '0.5s' }}>
      </div>

      {/* Optional Inner Glow Ring */}
      <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent 
                  border-t-yellow-400/40 
                  animate-spin"
           style={{ animationDuration: '1.2s' }}>
      </div>

    </div>
  </div>
)

export default Loader

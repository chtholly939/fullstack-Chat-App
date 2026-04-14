// const AuthImagePattern = ({ title, subtitle }) => {
//   return (
//     <div className="hidden lg:flex items-center justify-center bg-base-200 p-12">
//       <div className="max-w-md text-center">
//         <div className="grid grid-cols-3 gap-3 mb-8">
//           {[...Array(9)].map((_, i) => (
//             <div
//               key={i}
//               className={`aspect-square rounded-2xl bg-primary/10 ${
//                 i % 2 === 0 ? "animate-pulse" : ""
//               }`}
//             />
//           ))}
//         </div>
//         <h2 className="text-2xl font-bold mb-4">{title}</h2>
//         <p className="text-base-content/60">{subtitle}</p>
//       </div>
//     </div>
//   );
// };

// export default AuthImagePattern;

const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12">
      <div className="max-w-md text-center">
        <div className="flex flex-col gap-3 mb-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`max-w-[70%] p-3 rounded-2xl ${
                i % 2 === 0
                  ? "bg-primary text-primary-content self-start"
                  : "bg-base-300 self-end"
              } animate-fade-in`}
            >
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-current rounded-full"></span>
                <span className="w-2 h-2 bg-current rounded-full"></span>
                <span className="w-2 h-2 bg-current rounded-full"></span>
              </div>
            </div>
          ))}
        </div>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-base-content/60">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;

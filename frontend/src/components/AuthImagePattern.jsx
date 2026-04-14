import {
  MessageSquare,
  Phone,
  Users,
  Settings,
  Image,
  Shield,
  Clock,
  Smile,
  Paperclip,
} from "lucide-react";

const AuthImagePattern = ({ title, subtitle }) => {
  const icons = [
    MessageSquare,
    Phone,
    Users,
    Settings,
    Image,
    Shield,
    Clock,
    Smile,
    Paperclip,
  ];

  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12">
      
      <div className="max-w-lg text-center">
        
        {/* 🔥 Icon Grid */}
        <div className="grid grid-cols-3 gap-10 mb-10 justify-items-center">
          
          {icons.map((Icon, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-primary/10 shadow-sm 
                         transition-all duration-300 hover:scale-110 hover:bg-primary/20"
            >
              <Icon
                className={`w-10 h-10 ${
                  Icon === Shield ? "text-primary/80" : "text-primary"
                }`}
              />
            </div>
          ))}
        
        </div>

        {/* 🔹 Text */}
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-base-content/60">{subtitle}</p>

      </div>
    </div>
  );
};

export default AuthImagePattern;
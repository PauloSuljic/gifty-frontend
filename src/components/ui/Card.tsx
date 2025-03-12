interface CardProps {
    children: React.ReactNode;
  }
  
  const Card = ({ children }: CardProps) => {
    return <div className="p-4 border rounded-lg shadow-md bg-white">{children}</div>;
  };
  
  export default Card;
  
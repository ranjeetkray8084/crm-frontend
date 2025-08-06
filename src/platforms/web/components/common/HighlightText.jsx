const HighlightText = ({ text, searchTerm }) => {
  if (!searchTerm || !text) {
    return <span>{text}</span>;
  }

  const parts = text.toString().split(new RegExp(`(${searchTerm})`, 'gi'));
  
  return (
    <span>
      {parts.map((part, index) => 
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 px-1 rounded">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};

export default HighlightText;
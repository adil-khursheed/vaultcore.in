import React from "react";

const StructuredData = ({ data }: { data: Record<string, unknown> }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
};

export default StructuredData;

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useState, useRef, useCallback, useEffect } from "react";
import { QR } from "react-qr-rounded";
import { useForm } from "react-hook-form";
import "./App.css";

type FormValues = {
  qrText: string;
};

function App() {
  const [qrValue, setQrValue] = useState("In seeking the unattainable, simplicity only gets in the way.");
  const [qrColor, setQrColor] = useState("#000000");
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [cornerRadius, setCornerRadius] = useState(0);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [qrSize, setQrSize] = useState(180);
  const qrRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { register, watch } = useForm<FormValues>({
    defaultValues: {
      qrText: "",
    },
  });

  // Set document title for SEO
  useEffect(() => {
    document.title = "create qr";
    
    // Add meta description for SEO
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "create qr for free. unlimited, ad free and open source.");
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = "description";
      newMeta.content = "create qr for free. unlimited, ad free and open source.";
      document.head.appendChild(newMeta);
    }
  }, []);

  // Responsive QR code sizing
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 640;
      setQrSize(isMobile ? 150 : 180);
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent scrolling on mobile
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.height = "100%";
    
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    };
  }, []);

  // Watch for changes in the input
  useEffect(() => {
    const subscription = watch((value) => {
      if (value.qrText && value.qrText !== "") {
        setQrValue(value.qrText);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [watch]);

  const errorCorrectionMap = ["L", "M", "Q", "H"] as const;
  
  const handleSliderChange = (value: number[]) => {
    // Map 0-100 to 0-3 index
    const levelIndex = Math.min(3, Math.floor(value[0] / 25));
    setErrorCorrectionLevel(errorCorrectionMap[levelIndex]);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setLogoImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      setQrValue(value);
    }
  };

  // Simple function to download SVG directly
  const downloadSVG = useCallback(() => {
    console.log("Starting SVG download...");
    if (!qrRef.current) {
      console.error("QR code container not found");
      return;
    }

    try {
      const svgElement = qrRef.current.querySelector("svg");
      if (!svgElement) {
        console.error("SVG element not found");
        return;
      }

      // Clone the SVG so we don't modify the displayed one
      const clonedSvg = svgElement.cloneNode(true) as SVGElement;
      
      // Ensure proper attributes for standalone SVG
      clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clonedSvg.setAttribute("width", `${qrSize}px`);
      clonedSvg.setAttribute("height", `${qrSize}px`);
      
      // Serialize SVG to XML string
      const serializer = new XMLSerializer();
      let svgData = serializer.serializeToString(clonedSvg);
      
      // Add XML declaration
      svgData = '<?xml version="1.0" standalone="no"?>\r\n' + svgData;
      
      // Create a Blob containing the SVG data
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      
      console.log("SVG blob created:", svgBlob.size, "bytes");
      
      // Create a download link
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(svgBlob);
      downloadLink.download = "qrcode.svg";
      
      console.log("Download link created:", downloadLink.href);
      
      // Append to body, click, and remove
      document.body.appendChild(downloadLink);
      console.log("Link appended to document");
      
      // Use a timeout to ensure the link is in the DOM
      setTimeout(() => {
        console.log("Clicking download link...");
        downloadLink.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(downloadLink.href);
          console.log("Download link removed and URL revoked");
        }, 100);
      }, 100);
    } catch (error) {
      console.error("Error in SVG download:", error);
    }
  }, [qrRef, qrSize]);

  // Simplified PNG download function
  const downloadPNG = useCallback(() => {
    console.log("Starting PNG download...");
    if (!qrRef.current) {
      console.error("QR code container not found");
      return;
    }

    try {
      const svgElement = qrRef.current.querySelector("svg");
      if (!svgElement) {
        console.error("SVG element not found");
        return;
      }

      // Create a canvas element
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Failed to get canvas context");
        return;
      }

      // Set canvas size
      const padding = 40;
      canvas.width = qrSize + padding;
      canvas.height = qrSize + padding;

      // Fill with white background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Get SVG data
      const serializer = new XMLSerializer();
      const svgData = serializer.serializeToString(svgElement);
      
      // Create an image from the SVG
      const img = new Image();
      
      // Set up image load handler
      img.onload = () => {
        console.log("SVG image loaded, drawing to canvas");
        // Draw the image centered
        ctx.drawImage(img, padding/2, padding/2, qrSize, qrSize);
        
        // Handle logo if present
        if (logoImage) {
          console.log("Logo present, adding to canvas");
          const logoImg = new Image();
          logoImg.onload = () => {
            // Calculate logo position and size
            const logoSize = qrSize / 4;
            const xPos = (canvas.width - logoSize) / 2;
            const yPos = (canvas.height - logoSize) / 2;
            
            // Add white background for logo
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(xPos, yPos, logoSize, logoSize);
            
            // Draw logo
            ctx.drawImage(logoImg, xPos, yPos, logoSize, logoSize);
            
            // Now get the image data and download
            finalizePngDownload();
          };
          
          logoImg.onerror = (err) => {
            console.error("Error loading logo:", err);
            finalizePngDownload();
          };
          
          logoImg.src = logoImage;
        } else {
          finalizePngDownload();
        }
        
        function finalizePngDownload() {
          try {
            console.log("Finalizing PNG download");
            // Get data URL from canvas
            const dataUrl = canvas.toDataURL("image/png");
            
            // Create and trigger download
            const downloadLink = document.createElement("a");
            downloadLink.href = dataUrl;
            downloadLink.download = "qrcode.png";
            
            // Add to DOM and click
            document.body.appendChild(downloadLink);
            console.log("PNG download link created and appended");
            
            setTimeout(() => {
              console.log("Clicking PNG download link");
              downloadLink.click();
              
              // Clean up
              setTimeout(() => {
                document.body.removeChild(downloadLink);
                console.log("PNG download completed and link removed");
              }, 100);
            }, 100);
          } catch (error) {
            console.error("Error in PNG finalization:", error);
          }
        }
      };
      
      img.onerror = (err) => {
        console.error("Error loading SVG for PNG conversion:", err);
      };
      
      const svgUrl = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
      console.log("Setting SVG image source");
      img.src = svgUrl;
      
    } catch (error) {
      console.error("Error in PNG download process:", error);
    }
  }, [qrRef, qrSize, logoImage]);

  // Handle download button click
  const handleDownload = useCallback((format: 'png' | 'svg') => {
    console.log(`Download requested for format: ${format}`);
    
    if (format === 'svg') {
      downloadSVG();
    } else {
      downloadPNG();
    }
  }, [downloadSVG, downloadPNG]);

  return (
    <div className="flex flex-col items-center justify-between h-[100dvh] w-full overflow-hidden touch-none p-2 md:p-4">
      <div className="flex flex-col items-center gap-3 mt-auto mb-auto">
        <h1 className="sr-only">create qr</h1>
        <div ref={qrRef}>
          <QR
            color={qrColor}
            backgroundColor="#fff"
            rounding={cornerRadius}
            cutout={!!logoImage}
            cutoutElement={
              logoImage ? (
                <img
                  src={logoImage}
                  alt="Logo"
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                />
              ) : undefined
            }
            errorCorrectionLevel={errorCorrectionLevel}
            style={{ width: qrSize, height: qrSize }}
          >
            {qrValue}
          </QR>
        </div>
        
        <div className="flex flex-col items-center gap-1 w-full">
          <Input
            placeholder="QR Text"
            className="w-full max-w-[300px] h-8 text-sm"
            {...register("qrText")}
            onChange={handleInputChange}
          />
          <div className="flex w-full max-w-[300px] items-center h-8">
            <span className="w-28 sm:w-36 text-left text-xs sm:text-sm">Error correction</span>
            <div className="flex-grow flex items-center gap-2">
              <div className="w-full max-w-[150px]">
                <Slider 
                  defaultValue={[25]} 
                  max={100} 
                  step={25} 
                  onValueChange={handleSliderChange}
                  className="w-full"
                />
              </div>
              <span className="w-6 text-center text-xs sm:text-sm">{errorCorrectionLevel}</span>
            </div>
          </div>
          <div className="flex w-full max-w-[300px] items-center h-8">
            <span className="w-28 sm:w-36 text-left text-xs sm:text-sm">Rounded Corners</span>
            <div className="flex-grow flex items-center gap-2">
              <div className="w-full max-w-[150px]">
                <Slider 
                  defaultValue={[0]} 
                  max={100} 
                  step={1} 
                  onValueChange={(value) => setCornerRadius(value[0])}
                  className="w-full"
                />
              </div>
              <span className="w-6 text-center text-xs sm:text-sm">{cornerRadius}</span>
            </div>
          </div>
          <div className="flex w-full max-w-[300px] items-center h-8">
            <span className="w-28 sm:w-36 text-left text-xs sm:text-sm">QR Color</span>
            <div className="flex-grow flex justify-center">
              <input 
                type="color" 
                value={qrColor} 
                onChange={(e) => setQrColor(e.target.value)} 
                className="w-8 h-8 cursor-pointer"
              />
            </div>
          </div>
          <div className="flex w-full max-w-[300px] items-center h-10">
            <span className="w-28 sm:w-36 text-left text-xs sm:text-sm">Center Logo</span>
            <div className="flex-grow flex items-center justify-between gap-4">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleImageClick}
                  className="h-8 text-xs"
                >
                  {logoImage ? 'Change Image' : 'Add Image'}
                </Button>
              </div>
              <div className="w-10 h-10 border border-gray-300 rounded flex items-center justify-center overflow-hidden relative">
                {logoImage && (
                  <>
                    <img src={logoImage} alt="Logo" className="max-w-full max-h-full" />
                    <button 
                      className="absolute top-0 right-0 bg-white/80 rounded-bl text-gray-600 hover:text-gray-900 w-4 h-4 flex items-center justify-center text-xs"
                      onClick={removeImage}
                    >
                      ✕
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex mt-2 gap-2">
            <Button className="h-8 text-sm" onClick={() => handleDownload('png')}>
              Download PNG
            </Button>
            <Button className="h-8 text-sm" onClick={() => handleDownload('svg')}>
              Download SVG
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Text */}
      <footer className="text-xs text-gray-500 mb-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          built with vite, ts, shadcn and ❤️
          <a 
            href="https://github.com/bilgi42/createqr" 
            target="_blank" 
            rel="noopener noreferrer"
            className="ml-2 opacity-80 hover:opacity-100 transition-opacity"
            aria-label="GitHub repository"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-500"
            >
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;

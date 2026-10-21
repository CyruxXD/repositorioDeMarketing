/** @type {import('tailwindcss').Config} */                                              
     module.exports = {                                                                       
       darkMode: "class",                                                                     
       content: ["./*.html"],                                                                 
       theme: {                                                                               
         extend: {                                                                            
           colors: {                                                                          
             primary: "#1D1D1F",                                                              
             secondary: "#1D1D1F",                                                            
             "background-light": "#E5E7EB",                                                   
             "background-dark": "#0F172A",                                                    
           },                                                                                 
           fontFamily: {                                                                      
             display: ["'Playfair Display'", "serif"],                                        
             sans: ["'Plus Jakarta Sans'", "sans-serif"],                                     
           },                                                                                 
           borderRadius: {                                                                    
             DEFAULT: "0.5rem",                                                               
             xl: "1rem",                                                                      
             "2xl": "1.5rem",                                                                 
             "3xl": "2.5rem",                                                                 
           },                                                                                 
         },                                                                                   
       },                                                                                     
       plugins: [                                                                             
         require("@tailwindcss/forms"),                                                       
         require("@tailwindcss/typography"),                                                  
         require("@tailwindcss/container-queries"),                                           
       ],                                                                                     
     };
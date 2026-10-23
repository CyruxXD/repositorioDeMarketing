/** @type {import('tailwindcss').Config} */                                              
     module.exports = {                                                                       
       darkMode: "class",                                                                     
       content: ["./*.html"],                                                                 
       theme: {                                                                               
         extend: {                                                                            
           colors: {                                                                          
             primary: "#FFC20E",
             secondary: "#FFFFFF",
             "background-light": "#F5F5F5",
             "background-dark": "#0E0E0E",
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

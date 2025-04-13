// import React, { useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Coffee } from "lucide-react";
// import { Input } from "../ui/input";
// import {
//   PayPalScriptProvider,
//   PayPalButtons,
//   usePayPalScriptReducer,
// } from "@paypal/react-paypal-js";

// interface SupportUsDialogProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// const SupportUsDialog: React.FC<SupportUsDialogProps> = ({ isOpen, onClose }) => {
//   const [selectedTab, setSelectedTab] = useState(1);
//   const [customCoffee, setCustomCoffee] = useState<number | string>("");
//   const pricePerCoffee = 1;

//   const donationAmount =
//     selectedTab > 0 ? selectedTab * pricePerCoffee : Number(customCoffee || 0) * pricePerCoffee;

//   const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = parseInt(e.target.value, 10);
//     setSelectedTab(0);
//     setCustomCoffee(isNaN(value) || value < 1 ? "" : value);
//   };

//   const paypalOptions = {
//     "client-id": import.meta.env.VITE_PAYPAL_CLIENT || "",
//     currency: "USD",
//   };

//   const PayPalButtonsWrapper: React.FC = () => {
//     const [{ isPending }] = usePayPalScriptReducer();

//     return isPending ? (
//       <div className="flex justify-center items-center h-16">
//         <p>Loading...</p>
//       </div>
//     ) : (
//       <PayPalButtons
//         style={{
//           shape: "rect",
//           layout: "vertical",
//           color: "gold",
//           label: "donate",
//         }}
//         createOrder={(data, actions) => {
//           return actions.order.create({
//             intent: "CAPTURE",
//             purchase_units: [
//               {
//                 amount: {
//                   currency_code: "USD",
//                   value: donationAmount.toFixed(2),
//                 },
//               },
//             ],
//           });
//         }}
//         onApprove={(data, actions) => {
//           if (actions.order) {
//             return actions.order.capture().then((details) => {
//               alert(
//                 `Thank you for your donation, ${details.payer.name.given_name}!`
//               );
//             });
//           }
//           return Promise.reject("Order capture is not available.");
//         }}
//         onError={(err) => {
//           alert(`An error occurred: ${err}`);
//         }}
//       />
//     );
//   };

//   if (!isOpen) return null;

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle className="text-center text-2xl font-bold">Get Us a Coffee!</DialogTitle>
//         </DialogHeader>

//           <DialogDescription className="text-center text-gray-600 dark:text-gray-400">
//             We are a team of developers and designers who love hiking and actively enjoy the
//             outdoors. Our mission is to help hikers organize their trips & bags with ease and share
//             their journeys with others.
//             <br />
//             <br />
//             If our work has made a positive impact on your hiking experience and you’d like to show
//             your support, feel free to buy us a coffee!
//           </DialogDescription>

//           <div className="flex flex-col items-center">
//             <Coffee className="w-14 h-14 text-yellow-500 mb-4" />
//             <p className="text-lg font-medium mb-4">Choose your coffee amount:</p>

//             <div className="flex justify-center gap-4 mb-4">
//               {[1, 3, 5].map((amount) => (
//                 <Button
//                   key={amount}
//                   variant={selectedTab === amount ? "ghost" : "outline"}
//                   onClick={() => {
//                     setSelectedTab(amount);
//                     setCustomCoffee("");
//                   }}
//                   className={`w-20 ${selectedTab === amount ? "bg-yellow-500 text-white" : ""}`}
//                 >
//                   {amount}x Coffee
//                 </Button>
//               ))}
//             </div>

//             <div className="flex flex-col items-center mb-4">
//               <Input
//                 type="number"
//                 min="1"
//                 value={customCoffee}
//                 onChange={handleCustomInputChange}
//                 placeholder="Enter coffee count"
//                 className="w-32 p-2 border border-gray-300 rounded-md text-center"
//               />
//             </div>

//             <p className="text-lg font-bold mb-6">
//               Donation Amount: ${donationAmount > 0 ? donationAmount : 0}.00 USD
//             </p>
//           </div>
       

//         <PayPalScriptProvider options={paypalOptions}>
//               <PayPalButtonsWrapper />
//             </PayPalScriptProvider>

//         <div className="flex justify-end">
//           <Button type="button" variant="outline" onClick={onClose} className="w-32">
//             Close
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default SupportUsDialog;

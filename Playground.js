// const getOrdinal = (n) => {
//     const s = ["th", "st", "nd", "rd"];
//     const v = n % 100;
//     return n + (s[(v - 20) % 10] || s[v] || s[0]);
// };

// function formatBirthday(dateStr?: string | null): string {
//   if (!dateStr) return "";
//   const date = new Date(dateStr);
//   if (isNaN(date.getTime())) return "";
  // const day = date.getDate();
  // const month = date.toLocaleString("en-US", { month: "long" });
  
  // const getOrdinal = (n: number) => {
  //   const s = ["th", "st", "nd", "rd"];
  //   const v = n % 100;
  //   return n + (s[(v - 20) % 10] || s[v] || s[0]);
  // };
  
  // return `${getOrdinal(day)} ${month}`;
// }

// console.log(formatBirthday("13-09-2005"));

function parentOrdinal(){
 const day = new Date().getDate();
 const month = new Date().toLocaleString("default", { month: "long" });;
  
  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  
  return `${getOrdinal(day)} ${month}`;
}

console.log(parentOrdinal());

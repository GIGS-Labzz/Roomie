import Paragraph from "../externals/Paragraph";
import Word from "../externals/Word";
import Cards from "../externals/Cards";

const paragraph = "Every year, thousands of Nigerian students move in with someone they barely know — and regret it within weeks. Bad roommates drain your money, your peace, and your grades. Roomie makes sure that never happens to you."


export function Intro() {
    return (
        <section
            id="how-it-works"
            className="relative min-h-[100dvh] w-full overflow-hidden bg-[#24685f]"
        >
          <Cards />
          <div className="h-[40vh]"></div>
          {/* <Paragraph value={paragraph}/> */}
          <Word value={paragraph}/>
          <div className="h-[90vh]"></div>
        </section>
    );
}
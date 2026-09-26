import Paragraph from "../externals/Paragraph";
import Word from "../externals/Word";
import Cards from "../externals/Cards";

const paragraph = "Roomie is a platform that connects students and young professionals with compatible roommates. It is a platform that helps people find roommates that they can live with comfortably."


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
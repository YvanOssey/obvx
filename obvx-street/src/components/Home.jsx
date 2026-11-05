import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import teeFront from "../assets/image/catalogues/catalogue-03.jpg"

export const Home = () => {
    return (
        <section id="accueil" className="border-b border-black/10" aria-labelledby="accueil-titre">
            <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-12 sm:px-8 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
                        Nouvelle collection
                    </p>
                    <h1
                        id="accueil-titre"
                        className="mt-4 text-5xl font-extrabold uppercase leading-[0.95] tracking-tight text-balance sm:text-6xl"
                    >
                        La rue comme
                        <br />
                        point de départ
                    </h1>
                    <p className="mt-6 max-w-md text-base leading-relaxed text-black/75">
                        OBVX est né dans la rue, pensé pour la rue. Pour ceux qui veulent porter une identité
                        forte, sans avoir à la justifier. Une première collection construite autour d&apos;une
                        seule idée&nbsp;: habiller sa culture avec élégance, sans compromis.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                        <Link
                            to="/collections"
                            className="group inline-flex min-h-12 items-center gap-2 border border-black bg-black px-7 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:border-amber-700 hover:bg-amber-700"
                        >
                            Voir la collection
                            <ArrowRight
                                size={18}
                                aria-hidden="true"
                                className="transition-transform duration-200 group-hover:translate-x-1"
                            />
                        </Link>
                        <Link
                            to="/about"
                            className="inline-flex min-h-12 items-center text-sm font-semibold uppercase tracking-wide underline decoration-black/30 underline-offset-4 transition-colors hover:text-amber-700"
                        >
                            Notre histoire
                        </Link>
                    </div>
                </div>

                <div className="border border-black/10 bg-white">
                    {/* Image principale : dimensions fixées (pas de saut de mise en page) et chargée en priorité */}
                    <img
                        src={teeFront}
                        alt="Deux personnes portant le t-shirt OBVX noir au logo globe"
                        width={664}
                        height={555}
                        fetchPriority="high"
                        className="h-auto w-full object-cover"
                    />
                </div>
            </div>
        </section>
    )
}

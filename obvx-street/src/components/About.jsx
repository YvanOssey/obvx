import { Link } from "react-router-dom"
import { usePageTitle } from "../hooks/usePageTitle"
import aboutImage from "../assets/image/catalogues/catalogue-04.jpg"

const VALUES = [
  {
    number: "01",
    title: "Identité",
    text: "Des pièces qui parlent pour toi. OBVX transforme les codes de la rue en silhouettes reconnaissables et sincères.",
  },
  {
    number: "02",
    title: "Culture",
    text: "Nos collections puisent dans les rencontres, les rythmes et les images qui font vivre notre quotidien.",
  },
  {
    number: "03",
    title: "Mouvement",
    text: "Nous avançons avec celles et ceux qui créent, osent et donnent une nouvelle direction à leur génération.",
  },
]

export const About = () => {
  usePageTitle("À propos")
  return (
    <div id="apropos" className="bg-cream">
      <section className="border-b border-black/10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-16 sm:px-8 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-20 lg:py-32">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
              À propos d&apos;OBVX
            </span>
            <h1 className="mt-5 max-w-xl text-5xl font-bold uppercase leading-[0.9] tracking-tight sm:text-7xl">
              Porter ce qui nous rassemble.
            </h1>
          </div>
          <div className="lg:pb-2">
            <p className="max-w-xl text-lg leading-relaxed text-black/75 sm:text-xl">
              OBVX est une marque de streetwear née d&apos;une envie simple : créer
              des vêtements qui portent une histoire, une énergie et une identité.
            </p>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-black/60">
              Entre héritage et mouvement, nous imaginons des pièces pensées pour
              la ville et pour celles et ceux qui la font vibrer. Chaque collection
              est une invitation à s&apos;exprimer sans filtre.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 px-6 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="order-2 flex flex-col justify-center py-16 sm:py-24 lg:order-1 lg:pr-20">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
              Notre histoire
            </span>
            <h2 className="mt-5 text-3xl font-bold uppercase leading-[0.95] tracking-tight sm:text-5xl">
              La rue comme point de départ.
            </h2>
            <div className="mt-8 space-y-5 text-sm leading-relaxed text-black/65 sm:text-base">
              <p>
                OBVX est né dans la rue, au croisement des styles, des parcours et
                des ambitions. Nous croyons qu&apos;un vêtement ne se contente pas
                d&apos;habiller : il raconte d&apos;où l&apos;on vient et où l&apos;on va.
              </p>
              <p>
                Notre approche est directe. Des graphismes forts, des coupes
                faciles à vivre et des pièces conçues pour accompagner le mouvement,
                jour après jour.
              </p>
            </div>
            <Link
              to="/collections"
              className="inline-flex min-h-12 items-center justify-center mt-9 w-fit border border-black bg-black px-7 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:border-amber-700 hover:bg-amber-700"
            >
              Découvrir la collection
            </Link>
          </div>
          <div className="order-1 min-h-[360px] border-x border-black/10 lg:order-2 lg:min-h-[600px]">
            <img
              src={aboutImage}
              alt="Silhouette portant une pièce de la collection OBVX"
              width={747}
              height={1024}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-black/10">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-24">
          <div className="mb-12 flex items-end justify-between gap-6 sm:mb-16">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
                Ce qui nous guide
              </span>
              <h2 className="mt-4 text-3xl font-bold uppercase leading-[0.95] tracking-tight sm:text-5xl">
                Nos essentiels
              </h2>
            </div>
            <span className="hidden text-6xl font-bold leading-none text-black/10 sm:block">
              OBVX
            </span>
          </div>
          <div className="grid grid-cols-1 border-t border-black/15 sm:grid-cols-3">
            {VALUES.map((value) => (
              <article
                key={value.number}
                className="border-b border-black/15 py-7 sm:border-b-0 sm:border-r sm:px-7 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0"
              >
                <span className="font-montserrat text-xs font-semibold text-amber-700">
                  {value.number}
                </span>
                <h3 className="mt-8 text-2xl font-bold uppercase tracking-tight">
                  {value.title}
                </h3>
                <p className="mt-4 max-w-xs text-sm leading-relaxed text-black/60">
                  {value.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-6 py-16 text-white sm:px-8 sm:py-24">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
              Rejoins le mouvement
            </span>
            <h2 className="mt-4 max-w-2xl text-4xl font-bold uppercase leading-[0.9] tracking-tight sm:text-6xl">
              Ton style. Ton histoire. Ton OBVX.
            </h2>
          </div>
          <Link
            to="/collections"
            className="inline-flex min-h-12 items-center justify-center border border-white px-7 text-sm font-semibold uppercase tracking-wide transition-colors hover:border-amber-300 hover:bg-amber-300 hover:text-black"
          >
            Shop maintenant
          </Link>
        </div>
      </section>
    </div>
  )
}
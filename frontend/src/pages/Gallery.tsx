import Layout from "../components/Layout";
import { useImages, DynamicImage } from "../lib/ImagesContext";

export default function Gallery() {
  const { images, loading } = useImages();
  const galleryItems = Object.values(images)
    .filter((s) => s.page === "Gallery")
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <Layout>
      <section className="bg-navy-950 text-white py-16">
        <div className="wrap">
          <p className="text-orange-300 font-semibold mb-2">Gallery</p>
          <h1 className="text-3xl sm:text-4xl font-serif-heading font-bold max-w-2xl">
            Courtesy meetings with the honoured guests of the nation.
          </h1>
          <p className="mt-4 max-w-2xl text-white/70">
            A record of respectful courtesy calls — with the Presidents of India, and with
            national and international dignitaries who received the Foundation with warmth.
          </p>
        </div>
      </section>

      <section className="wrap py-16">
        {loading && <p className="text-navy-900/50 text-sm">Loading gallery…</p>}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryItems.map((item) => (
            <figure key={item.slot_key} className="rounded-lg overflow-hidden bg-navy-900/5">
              <DynamicImage slotKey={item.slot_key} className="w-full h-44 object-cover" />
              <figcaption className="text-xs text-navy-900/60 p-2">{item.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </Layout>
  );
}

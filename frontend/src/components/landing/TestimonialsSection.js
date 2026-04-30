"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    name: "María & José",
    text: "Nos conocimos en Cuadralo hace 6 meses y ahora somos novios. ¡Gracias por unirnos!",
    rating: 5,
  },
  {
    name: "Andrea",
    text: "La mejor app de citas en Venezuela. He conocido personas increíbles y hecho amigos para toda la vida.",
    rating: 5,
  },
  {
    name: "Carlos",
    text: "Me encanta la función de verificación facial. Te da mucha tranquilidad saber que las personas son reales.",
    rating: 5,
  },
  {
    name: "Sofía & Alejandro",
    text: "Gracias a Cuadralo encontramos el amor. La función de video llamadas nos ayudó a conocernos antes de vernos.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-20 bg-[#0B0410] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cuadralo-pink/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-cuadralo-purple/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-cuadralo-purple/10 text-cuadralo-purple px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Quote size={16} />
            Testimonios
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            Lo que dicen nuestros
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cuadralo-pink to-cuadralo-purple">
              {" "}usuarios
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Miles de personas han encontrado conexiones reales. Estas son sus historias.
          </p>
        </motion.div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="relative bg-[#150A21] rounded-3xl p-6 border border-white/10 hover:border-cuadralo-pink/30 transition-all duration-300 group"
            >
              <div className="absolute top-4 right-4 text-cuadralo-pink/20 group-hover:text-cuadralo-pink/40 transition-colors">
                <Quote size={32} />
              </div>

              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-white/80 mb-4 italic text-sm">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cuadralo-pink to-cuadralo-purple flex items-center justify-center text-white font-bold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">
                    {testimonial.name}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-[#150A21] rounded-3xl p-6 border border-white/10"
          >
            <div className="text-cuadralo-pink/40 mb-4">
              <Quote size={32} />
            </div>

            <div className="flex items-center gap-1 mb-4">
              {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-white/80 mb-4 italic">
              "{testimonials[currentIndex].text}"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cuadralo-pink to-cuadralo-purple flex items-center justify-center text-white font-bold">
                {testimonials[currentIndex].name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">
                  {testimonials[currentIndex].name}
                </p>
              </div>
            </div>
          </motion.div>

          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-[#150A21] shadow-lg flex items-center justify-center hover:bg-[#150A21]/80 transition-colors"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-[#150A21] shadow-lg flex items-center justify-center hover:bg-[#150A21]/80 transition-colors"
          >
            <ChevronRight size={20} className="text-white" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-6 bg-cuadralo-pink"
                    : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

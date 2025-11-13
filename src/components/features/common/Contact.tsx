import { addToast } from "@heroui/react";

export const ContactView = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({ title: "Mensaje enviado", description: "Nos pondremos en contacto pronto.", timeout: 3000 });
  };

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-32">
      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="justify-center">
                        <h1 className="text-4xl md:text-5xl text-center font-extralight tracking-widest mb-8 uppercase">CONTACTO</h1>
          <p className="text-center pb-16 text-muted-foreground tracking-wide">Estamos aquí para ayudarte</p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-light tracking-wider mb-2">Envíanos un mensaje</h2>
              <p className="text-sm text-muted-foreground">
                Responderemos a tu consulta en menos de 24 horas
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">Nombre</label>
                  <input 
                    id="firstName" 
                    required 
                    className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-luxury-burgundy focus:border-luxury-burgundy"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">Apellido</label>
                  <input 
                    id="lastName" 
                    required 
                    className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-luxury-burgundy focus:border-luxury-burgundy"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <input 
                  id="email" 
                  type="email" 
                  required 
                  className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-luxury-burgundy focus:border-luxury-burgundy"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">Teléfono (opcional)</label>
                <input 
                  id="phone" 
                  type="tel" 
                  className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-luxury-burgundy focus:border-luxury-burgundy"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">Asunto</label>
                <input 
                  id="subject" 
                  required 
                  className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-luxury-burgundy focus:border-luxury-burgundy"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">Mensaje</label>
                <textarea
                  id="message"
                  rows={6}
                  required
                  className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-luxury-burgundy focus:border-luxury-burgundy resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-luxury-burgundy hover:bg-luxury-burgundyHover text-white py-3 px-6 tracking-wider transition-colors"
              >
                ENVIAR MENSAJE
              </button>
            </form>
          </div>          
        </div>
      </div>
    </div>
  );
};

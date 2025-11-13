import React from "react";
import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, addToast } from "@heroui/react";
import { Eye, EyeOff } from "lucide-react";

interface LoginSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginSidebar = ({ isOpen, onClose }: LoginSidebarProps) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  
  // Estados para mensajes de error
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  
  const API_BASE = (import.meta as any).env?.VITE_API_BASE;
  const showAlert = (title: string, description: string) => {
    addToast({ title, description, timeout: 3000 });
  };

  const extractErrorMessage = (data: any) => {
    try {
      if (data && typeof data === "object") {
        if (data.errors && typeof data.errors === "object") {
          const keys = Object.keys(data.errors);
          if (keys.length > 0) {
            const arr = (data.errors as any)[keys[0]];
            if (Array.isArray(arr) && arr.length > 0) return String(arr[0]);
          }
        }
        if (data.message) return String(data.message);
      }
    } catch {}
    return null;
  };

  // Validación de email
  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setEmailError("El email es requerido");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Email inválido");
      return false;
    }
    setEmailError("");
    return true;
  };

  // Validación de contraseña
  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError("La contraseña es requerida");
      return false;
    }
    if (password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    setPasswordError("");
    return true;
  };

  // Validación de nombre
  const validateName = (name: string): boolean => {
    if (!name.trim()) {
      setNameError("El nombre es requerido");
      return false;
    }
    if (name.trim().length < 3) {
      setNameError("El nombre debe tener al menos 3 caracteres");
      return false;
    }
    setNameError("");
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = extractErrorMessage(data) || "Error al iniciar sesión";
        showAlert('Error', String(msg));
        return;
      }
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      showAlert('Inicio de sesión exitoso', 'Has iniciado sesión correctamente');
      
      // Limpiar formulario
      setEmail("");
      setPassword("");
      setEmailError("");
      setPasswordError("");
      
      onClose();
    } catch (err) {
      showAlert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isNameValid || !isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = extractErrorMessage(data) || "Error al crear la cuenta";
        showAlert('Error', String(msg));
        return;
      }
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      showAlert('Cuenta creada exitosamente', 'Tu cuenta fue creada correctamente');
      
      // Limpiar formulario
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setNameError("");
      setEmailError("");
      setPasswordError("");
      setPhoneError("");
      
      onClose();
    } catch (err) {
      showAlert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // Limpiar errores al cambiar de tab
  const handleTabChange = (tab: "login" | "signup") => {
    setActiveTab(tab);
    setEmail("");
    setPassword("");
    setName("");
    setPhone("");
    setEmailError("");
    setPasswordError("");
    setNameError("");
    setPhoneError("");
  };

  // Validar en tiempo real al salir del campo
  const handleEmailBlur = () => {
    if (email) validateEmail(email);
  };

  const handlePasswordBlur = () => {
    if (password) validatePassword(password);
  };

  const handleNameBlur = () => {
    if (name) validateName(name);
  };

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      radius="none"
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent>
        {() => (
          <>
            <DrawerHeader className="flex flex-col font-normal gap-1">
              MI CUENTA
            </DrawerHeader>
            <DrawerBody>
              <div className="mt-2">
                <div className="grid grid-cols-2 gap-2 mb-6 bg-muted p-1">
                  <button
                    type="button"
                    onClick={() => handleTabChange("login")}
                    disabled={isLoading}
                    className={`w-full text-center py-2 px-4 transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                      activeTab === "login"
                        ? "bg-[#314737] text-white shadow-sm"
                        : "border border-[#314737] text-[#314737] hover:bg-[#314737]/70 hover:text-white"
                    }`}
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange("signup")}
                    disabled={isLoading}
                    className={`w-full text-center py-2 px-4 transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                      activeTab === "signup"
                        ? "bg-[#314737] text-white shadow-sm"
                        : "border border-[#314737] text-[#314737] hover:bg-[#314737]/70 hover:text-white"
                    }`}
                  >
                    Registrarse
                  </button>
                </div>

                {activeTab === "login" && (
                  <div className="space-y-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="login-email" className="text-sm font-medium">
                          Email
                        </label>
                        <input
                          id="login-email"
                          type="email"
                          placeholder="correo@ejemplo.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (emailError) setEmailError("");
                          }}
                          onBlur={handleEmailBlur}
                          disabled={isLoading}
                          className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                            emailError
                              ? "border-red-500 focus:ring-red-500"
                              : "border-border focus:ring-[#314737]"
                          }`}
                        />
                        {emailError && (
                          <p className="text-xs text-red-500 mt-1">{emailError}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="login-password" className="text-sm font-medium">
                          Contraseña
                        </label>
                        <div className="relative">
                          <input
                            id="login-password"
                            type={showLoginPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (passwordError) setPasswordError("");
                            }}
                            onBlur={handlePasswordBlur}
                            disabled={isLoading}
                            className={`w-full px-3 py-2 border pr-10 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                              passwordError
                                ? "border-red-500 focus:ring-red-500"
                                : "border-border focus:ring-[#314737]"
                            }`}
                          />
                          <button
                            type="button"
                            aria-label={showLoginPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            onClick={() => setShowLoginPassword((v) => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {passwordError && (
                          <p className="text-xs text-red-500 mt-1">{passwordError}</p>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading || !email || !password}
                        className="w-full bg-[#314737] text-white px-4 py-3 text-sm tracking-wide uppercase font-light hover:bg-[#314737]/70 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span>INICIANDO...</span>
                          </>
                        ) : (
                          "INICIAR SESIÓN"
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {activeTab === "signup" && (
                  <div className="space-y-4">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="signup-name" className="text-sm font-medium">
                          Nombre completo
                        </label>
                        <input
                          id="signup-name"
                          type="text"
                          placeholder="Juan Pérez"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (nameError) setNameError("");
                          }}
                          onBlur={handleNameBlur}
                          disabled={isLoading}
                          className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                            nameError
                              ? "border-red-500 focus:ring-red-500"
                              : "border-border focus:ring-[#314737]"
                          }`}
                        />
                        {nameError && (
                          <p className="text-xs text-red-500 mt-1">{nameError}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="signup-email" className="text-sm font-medium">
                          Email
                        </label>
                        <input
                          id="signup-email"
                          type="email"
                          placeholder="correo@ejemplo.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (emailError) setEmailError("");
                          }}
                          onBlur={handleEmailBlur}
                          disabled={isLoading}
                          className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                            emailError
                              ? "border-red-500 focus:ring-red-500"
                              : "border-border focus:ring-[#314737]"
                          }`}
                        />
                        {emailError && (
                          <p className="text-xs text-red-500 mt-1">{emailError}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="signup-password" className="text-sm font-medium">
                          Contraseña
                        </label>
                        <div className="relative">
                          <input
                            id="signup-password"
                            type={showSignupPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (passwordError) setPasswordError("");
                            }}
                            onBlur={handlePasswordBlur}
                            disabled={isLoading}
                            className={`w-full px-3 py-2 border rounded pr-10 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                              passwordError
                                ? "border-red-500 focus:ring-red-500"
                                : "border-border focus:ring-[#314737]"
                            }`}
                          />
                          <button
                            type="button"
                            aria-label={showSignupPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            onClick={() => setShowSignupPassword((v) => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {passwordError && (
                          <p className="text-xs text-red-500 mt-1">{passwordError}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="signup-phone" className="text-sm font-medium">
                          Teléfono
                        </label>
                        <input
                          id="signup-phone"
                          type="tel"
                          placeholder="300 000 0000"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (phoneError) setPhoneError("");
                          }}
                          disabled={isLoading}
                          className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                            phoneError
                              ? "border-red-500 focus:ring-red-500"
                              : "border-border focus:ring-[#314737]"
                          }`}
                        />
                        {phoneError && (
                          <p className="text-xs text-red-500 mt-1">{phoneError}</p>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading || !name || !email || !password}
                        className="w-full bg-[#314737] text-white px-4 py-3 text-sm tracking-wide uppercase font-light hover:bg-[#314737]/70 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span>CREANDO...</span>
                          </>
                        ) : (
                          "CREAR CUENTA"
                        )}
                      </button>
                    </form>
                    <p className="text-xs text-center text-muted-foreground">
                      Al registrarte, aceptas nuestros términos y condiciones
                    </p>
                  </div>
                )}

                <div className="mt-8 pt-8 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center mb-4">Beneficios de tener una cuenta</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-black">✓</span>
                      <span>Seguimiento de pedidos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-black">✓</span>
                      <span>Acceso a ofertas exclusivas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-black">✓</span>
                      <span>Lista de deseos personalizada</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-black">✓</span>
                      <span>Historial de compras</span>
                    </li>
                  </ul>
                </div>
              </div>
            </DrawerBody>
            
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};
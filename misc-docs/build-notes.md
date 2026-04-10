Build Instructions: Local Development Environment (LDE)

Follow these steps on your Mac Mini to initialize the "Habit Layer" environment.

1. Initialize Astro Project

Open your terminal on your external hard drive and run:

npm create astro@latest habit-layer-spa -- --template minimal
cd habit-layer-spa
npm install @astrojs/react @astrojs/tailwind react react-dom framer-motion lucide-react canvas-confetti


2. Configure Astro

Ensure astro.config.mjs includes the React and Tailwind integrations.

3. Setup Branding

Update tailwind.config.js with the Agent Army color palette and Urbanist/Kumbh Sans font configuration.

4. Local Network Preview (For iPhone Pinning)

To view the app on your iPhone while it's running on your Mac:

Ensure both devices are on the same Wi-Fi.

Find your Mac's local IP (e.g., 192.168.1.XX).

Run the dev server with the host flag:

npm run dev -- --host


On iPhone Safari, go to http://192.168.1.XX:4321.

Tap Share -> Add to Home Screen.
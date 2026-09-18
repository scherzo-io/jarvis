import JarvisHud from "@/components/hud/JarvisHud";
import { JarvisShell } from "@/components/shell/JarvisShell";

export default function Home() {
  return (
    <JarvisShell>
      <JarvisHud />
    </JarvisShell>
  );
}

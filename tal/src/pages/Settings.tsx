import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const [settings, setSettings] = useState<any>({
    emailNotifications: true,
    inAppNotifications: true,
    theme: 'light',
  });
  const { toast } = useToast();

  useEffect(() => {
    db.settings?.get('main').then((s) => {
      if (s) setSettings(s);
    });
  }, []);

  const save = async () => {
    await db.settings?.put({ ...settings, id: 'main' });
    toast({ title: 'Saved', description: 'Settings saved' });
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card className="p-8 rounded-2xl">
        <h2 className="text-2xl font-bold mb-2">Settings</h2>
        <p className="text-muted-foreground mb-6">Application preferences</p>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive email updates about candidates and jobs</p>
            </div>
            <Switch checked={settings.emailNotifications} onCheckedChange={(v) => setSettings((s:any) => ({ ...s, emailNotifications: v }))} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">In-app Notifications</p>
              <p className="text-sm text-muted-foreground">Show notifications inside the app</p>
            </div>
            <Switch checked={settings.inAppNotifications} onCheckedChange={(v) => setSettings((s:any) => ({ ...s, inAppNotifications: v }))} />
          </div>

          <div>
            <p className="font-medium mb-2">Theme</p>
            <div className="flex gap-3">
              <Button variant={settings.theme === 'light' ? undefined : 'outline'} onClick={() => setSettings((s:any)=>({...s, theme: 'light'}))}>Light</Button>
              <Button variant={settings.theme === 'dark' ? undefined : 'outline'} onClick={() => setSettings((s:any)=>({...s, theme: 'dark'}))}>Dark</Button>
              <Button variant={settings.theme === 'system' ? undefined : 'outline'} onClick={() => setSettings((s:any)=>({...s, theme: 'system'}))}>System</Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={save}>Save changes</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

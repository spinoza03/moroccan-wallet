import React from 'react';
import { useI18n } from '@/lib/i18n';
import { useStore } from '@/lib/store-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Languages, Calendar } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { t, lang, setLang } = useI18n();
  const { settings, updateSettings } = useStore();

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">{t('settings.title')}</h1>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Languages className="w-4 h-4" /> {t('settings.language')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={lang} onValueChange={(v) => setLang(v as 'fr' | 'darija')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="darija">الدارجة المغربية</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" /> {t('settings.salaryDay')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">{t('settings.salaryDayDesc')}</p>
          <div className="flex items-center gap-4">
            <Slider
              value={[settings.salaryDay]}
              onValueChange={([v]) => updateSettings({ salaryDay: v })}
              min={1}
              max={31}
              step={1}
              className="flex-1"
            />
            <span className="text-lg font-bold text-primary w-8 text-center">{settings.salaryDay}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Languages, GlobeIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface DisplayText {
  text: string;
  language: string;
}

interface MultilingualEditorProps {
  texts: DisplayText[];
  onChange: (texts: DisplayText[]) => void;
  title?: string;
  multiline?: boolean;
  placeholder?: string;
  description?: string;
}

// Common language codes and their names
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
  { code: 'da', name: 'Danish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'fi', name: 'Finnish' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
];

export const MultilingualEditor: React.FC<MultilingualEditorProps> = ({
  texts,
  onChange,
  title = 'Multilingual Text',
  multiline = false,
  placeholder = 'Enter text',
  description = 'Add translations for different languages'
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newText, setNewText] = useState<DisplayText>({
    text: '',
    language: 'en'
  });
  
  // Get available languages (those not already in use)
  const getAvailableLanguages = () => {
    const usedLanguages = texts.map(t => t.language);
    return LANGUAGES.filter(lang => !usedLanguages.includes(lang.code));
  };
  
  // Add new text
  const handleAddText = () => {
    if (newText.text.trim() === '') return;
    
    onChange([...texts, newText]);
    setNewText({
      text: '',
      language: getAvailableLanguages()[0]?.code || 'en'
    });
    setShowAddForm(false);
  };
  
  // Remove text at index
  const handleRemoveText = (index: number) => {
    const updatedTexts = [...texts];
    updatedTexts.splice(index, 1);
    onChange(updatedTexts);
  };
  
  // Update text at index
  const handleUpdateText = (index: number, value: string) => {
    const updatedTexts = [...texts];
    updatedTexts[index] = {
      ...updatedTexts[index],
      text: value
    };
    onChange(updatedTexts);
  };
  
  // Get language name from code
  const getLanguageName = (code: string) => {
    return LANGUAGES.find(lang => lang.code === code)?.name || code;
  };
  
  // Check if we have any available languages left
  const hasAvailableLanguages = getAvailableLanguages().length > 0;
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <GlobeIcon className="h-4 w-4 mr-2 text-muted-foreground" />
          <h4 className="font-medium">{title}</h4>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm || !hasAvailableLanguages}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Language
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground">{description}</p>
      
      {texts.length === 0 && !showAddForm ? (
        <Alert>
          <AlertDescription>
            No translations defined. Add at least one language.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-3">
          {/* Tab navigation between languages */}
          {texts.length > 0 && (
            <Tabs defaultValue={texts[0].language}>
              <TabsList className="mb-4">
                {texts.map(text => (
                  <TabsTrigger key={text.language} value={text.language}>
                    <span className="font-medium">{getLanguageName(text.language)}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {texts.map((text, index) => (
                <TabsContent key={text.language} value={text.language} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">
                      <GlobeIcon className="h-3 w-3 mr-1" />
                      {getLanguageName(text.language)}
                    </Badge>
                    
                    <Button
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveText(index)}
                      className="h-8 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                  
                  {multiline ? (
                    <Textarea
                      value={text.text}
                      onChange={(e) => handleUpdateText(index, e.target.value)}
                      placeholder={placeholder}
                      rows={4}
                    />
                  ) : (
                    <Input
                      value={text.text}
                      onChange={(e) => handleUpdateText(index, e.target.value)}
                      placeholder={placeholder}
                    />
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
          
          {/* Add new language form */}
          {showAddForm && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">New Translation</CardTitle>
              </CardHeader>
              
              <CardContent className="py-2 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-language">Language</Label>
                  <Select
                    value={newText.language}
                    onValueChange={(value) => setNewText({...newText, language: value})}
                  >
                    <SelectTrigger id="new-language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableLanguages().map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-text-content">Text</Label>
                  {multiline ? (
                    <Textarea
                      id="new-text-content"
                      value={newText.text}
                      onChange={(e) => setNewText({...newText, text: e.target.value})}
                      placeholder={placeholder}
                      rows={4}
                    />
                  ) : (
                    <Input
                      id="new-text-content"
                      value={newText.text}
                      onChange={(e) => setNewText({...newText, text: e.target.value})}
                      placeholder={placeholder}
                    />
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end space-x-2 py-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleAddText}
                  disabled={newText.text.trim() === ''}
                >
                  Add Translation
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default MultilingualEditor;

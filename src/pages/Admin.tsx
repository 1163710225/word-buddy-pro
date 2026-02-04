import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMenuSettings, useUpdateMenuSetting } from '@/hooks/useMenuSettings';
import { useWordbooks, useCreateWordbook, useImportWords } from '@/hooks/useWordbooks';
import { Settings, Upload, BookOpen, FileSpreadsheet, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Admin = () => {
  const { data: menuSettings, isLoading: menuLoading } = useMenuSettings();
  const { data: wordbooks } = useWordbooks();
  const updateMenuSetting = useUpdateMenuSetting();
  const createWordbook = useCreateWordbook();
  const importWords = useImportWords();

  const [newWordbook, setNewWordbook] = useState({
    name: '',
    description: '',
    icon: '📚',
    category: 'exam',
    level: '中级',
  });

  const [selectedWordbookId, setSelectedWordbookId] = useState('');
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);

  const handleMenuToggle = (id: string, currentVisible: boolean) => {
    updateMenuSetting.mutate({ id, is_visible: !currentVisible });
  };

  const handleCreateWordbook = async () => {
    if (!newWordbook.name) {
      toast.error('请输入词库名称');
      return;
    }

    await createWordbook.mutateAsync(newWordbook);
    setNewWordbook({
      name: '',
      description: '',
      icon: '📚',
      category: 'exam',
      level: '中级',
    });
  };

  const handleImportWords = async () => {
    if (!selectedWordbookId) {
      toast.error('请选择目标词库');
      return;
    }
    if (!importText.trim()) {
      toast.error('请输入单词数据');
      return;
    }

    setImporting(true);
    try {
      // Parse CSV/TSV format
      const lines = importText.trim().split('\n');
      const words = lines.slice(1).map(line => {
        const parts = line.split('\t').length > 1 ? line.split('\t') : line.split(',');
        return {
          word: parts[0]?.trim() || '',
          phonetic: parts[1]?.trim() || '',
          meaning: parts[2]?.trim() || '',
          example: parts[3]?.trim() || '',
          example_translation: parts[4]?.trim() || '',
          difficulty: (parts[5]?.trim() || 'medium') as 'easy' | 'medium' | 'hard',
        };
      }).filter(w => w.word && w.meaning);

      if (words.length === 0) {
        toast.error('没有找到有效的单词数据');
        return;
      }

      await importWords.mutateAsync({ wordbookId: selectedWordbookId, words });
      setImportText('');
      toast.success(`成功导入 ${words.length} 个单词`);
    } catch (error) {
      console.error('Import error:', error);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `word\tphonetic\tmeaning\texample\texample_translation\tdifficulty
example\t/ɪɡˈzɑːmpl/\tn. 例子，榜样\tThis is an example sentence.\t这是一个例句。\tmedium
accomplish\t/əˈkɑːmplɪʃ/\tv. 完成，实现\tShe accomplished her goal.\t她实现了目标。\tmedium`;
    
    const blob = new Blob([template], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'word_import_template.tsv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">管理后台</h1>
          <p className="text-muted-foreground mt-1">管理菜单功能和词库内容</p>
        </div>

        <Tabs defaultValue="menu" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="menu">
              <Settings className="w-4 h-4 mr-2" />
              菜单管理
            </TabsTrigger>
            <TabsTrigger value="wordbook">
              <BookOpen className="w-4 h-4 mr-2" />
              词库管理
            </TabsTrigger>
            <TabsTrigger value="import">
              <Upload className="w-4 h-4 mr-2" />
              导入单词
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu">
            <Card>
              <CardHeader>
                <CardTitle>菜单功能管理</CardTitle>
                <CardDescription>控制用户可见的菜单功能</CardDescription>
              </CardHeader>
              <CardContent>
                {menuLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {menuSettings?.map((menu) => (
                      <div
                        key={menu.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">
                            {menu.menu_key === 'home' && '🏠'}
                            {menu.menu_key === 'wordbooks' && '📚'}
                            {menu.menu_key === 'study' && '📖'}
                            {menu.menu_key === 'review' && '🧠'}
                            {menu.menu_key === 'games' && '🎮'}
                            {menu.menu_key === 'plan' && '📅'}
                            {menu.menu_key === 'stats' && '📊'}
                            {menu.menu_key === 'ai' && '✨'}
                          </span>
                          <div>
                            <p className="font-medium">{menu.menu_name}</p>
                            <p className="text-sm text-muted-foreground">/{menu.menu_key}</p>
                          </div>
                        </div>
                        <Switch
                          checked={menu.is_visible}
                          onCheckedChange={() => handleMenuToggle(menu.id, menu.is_visible)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wordbook">
            <Card>
              <CardHeader>
                <CardTitle>创建新词库</CardTitle>
                <CardDescription>添加新的词库用于学习</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>词库名称</Label>
                    <Input
                      value={newWordbook.name}
                      onChange={(e) => setNewWordbook({ ...newWordbook, name: e.target.value })}
                      placeholder="例如：托福核心词汇"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>图标</Label>
                    <Input
                      value={newWordbook.icon}
                      onChange={(e) => setNewWordbook({ ...newWordbook, icon: e.target.value })}
                      placeholder="📚"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>描述</Label>
                  <Textarea
                    value={newWordbook.description}
                    onChange={(e) => setNewWordbook({ ...newWordbook, description: e.target.value })}
                    placeholder="词库简介..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>分类</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={newWordbook.category}
                      onChange={(e) => setNewWordbook({ ...newWordbook, category: e.target.value })}
                    >
                      <option value="exam">考试词库</option>
                      <option value="daily">日常口语</option>
                      <option value="business">商务英语</option>
                      <option value="academic">学术英语</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>难度等级</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={newWordbook.level}
                      onChange={(e) => setNewWordbook({ ...newWordbook, level: e.target.value })}
                    >
                      <option value="初级">初级</option>
                      <option value="中级">中级</option>
                      <option value="高级">高级</option>
                    </select>
                  </div>
                </div>
                <Button
                  onClick={handleCreateWordbook}
                  className="gradient-primary"
                  disabled={createWordbook.isPending}
                >
                  {createWordbook.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <BookOpen className="w-4 h-4 mr-2" />
                  )}
                  创建词库
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  批量导入单词
                </CardTitle>
                <CardDescription>
                  使用 TSV 或 CSV 格式批量导入单词到词库
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="w-4 h-4 mr-2" />
                    下载导入模板
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>选择目标词库</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={selectedWordbookId}
                    onChange={(e) => setSelectedWordbookId(e.target.value)}
                  >
                    <option value="">-- 请选择词库 --</option>
                    {wordbooks?.map((wb) => (
                      <option key={wb.id} value={wb.id}>
                        {wb.icon} {wb.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>粘贴单词数据 (TSV/CSV 格式)</Label>
                  <Textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder={`word\tphonetic\tmeaning\texample\texample_translation\tdifficulty
example\t/ɪɡˈzɑːmpl/\tn. 例子\tThis is an example.\t这是一个例子。\tmedium`}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>

                <Button
                  onClick={handleImportWords}
                  className="gradient-primary"
                  disabled={importing}
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      导入中...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      导入单词
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Admin;

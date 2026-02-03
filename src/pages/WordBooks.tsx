import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { WordBookCard } from '@/components/wordbook/WordBookCard';
import { mockWordBooks } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Filter } from 'lucide-react';

const WordBooks = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = [
    { id: null, label: '全部' },
    { id: 'exam', label: '考试词库' },
    { id: 'daily', label: '日常口语' },
    { id: 'business', label: '商务英语' },
    { id: 'custom', label: '我的词本' },
  ];

  const filteredBooks = mockWordBooks.filter((book) => {
    const matchesSearch = book.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !activeCategory || book.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBookClick = (bookId: string) => {
    navigate(`/wordbooks/${bookId}`);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">词库</h1>
            <p className="text-muted-foreground mt-1">选择词库开始学习</p>
          </div>
          <Button className="gradient-primary shadow-primary">
            <Plus className="w-4 h-4 mr-2" />
            导入词库
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索词库..."
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.id || 'all'}
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className={activeCategory === cat.id ? 'gradient-primary' : ''}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Word Books Grid */}
        <div className="grid grid-cols-2 gap-6">
          {filteredBooks.map((book, index) => (
            <div
              key={book.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <WordBookCard book={book} onClick={() => handleBookClick(book.id)} />
            </div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">没有找到匹配的词库</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default WordBooks;


'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Database } from 'lucide-react';
import { toast } from 'sonner';

interface AiTutorDialogProps {
    moduleId: string;
    topicId: string;
    topicName: string;
}

export function AiTutorDialog({ moduleId, topicId, topicName }: AiTutorDialogProps) {
    const [open, setOpen] = useState(false);
    const [code, setCode] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (code.length < 10) {
            toast.error("Please paste your Gosu code.");
            return;
        }

        setIsAnalyzing(true);
        // Simulate AI analysis delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock Feedback based on topicName (naive)
        let mockFeedback = "Code analysis complete. Your logic seems sound, but check for null safety.";
        if (topicName.toLowerCase().includes('policy')) {
            mockFeedback = `
### Analysis for ${topicName}

**Strengths:**
- Correct use of entity types.
- Good variable naming.

**Suggestions:**
- Consider using a query builder instead of raw SQL for performance.
- Add null checks for \`policyPeriod\`.

**Grade:** B+
            `;
        } else if (topicName.toLowerCase().includes('claim')) {
            mockFeedback = `
### Analysis for ${topicName}

**Strengths:**
- Properly handled the claim lifecycle.

**Suggestions:**
- You missed the 'Draft' state handling. Note that claims start in Draft.

**Grade:** A-
            `;
        }

        setFeedback(mockFeedback);
        setIsAnalyzing(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-rust text-rust hover:bg-rust hover:text-white transition-colors gap-2">
                    <Sparkles size={16} /> Data Tutor
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="text-rust" size={20} />
                        Guidewire AI Tutor
                    </DialogTitle>
                    <DialogDescription>
                        Paste your Gosu code below. The AI will analyze it against best practices and the solution pattern.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {!feedback ? (
                        <>
                            <Textarea
                                placeholder="// Paste your .gsp or .gs content here..."
                                className="min-h-[300px] font-mono text-sm bg-stone-50 border-stone-200"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                            <div className="flex items-center gap-2 text-xs text-stone-500">
                                <Database size={12} />
                                <span>Analyzing context: {topicName}</span>
                            </div>
                        </>
                    ) : (
                        <div className="min-h-[300px] bg-stone-50 border border-stone-100 rounded-lg p-6 overflow-y-auto">
                            <div className="prose prose-sm max-w-none prose-headings:text-charcoal prose-strong:text-rust">
                                {/* Ideally sanitize markdown */}
                                <div dangerouslySetInnerHTML={{ __html: feedback.replace(/\n/g, '<br/>') }} />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    {feedback && (
                        <Button variant="outline" onClick={() => { setFeedback(null); setCode(''); }}>
                            Analyze Another Snippet
                        </Button>
                    )}
                    <Button onClick={handleAnalyze} disabled={isAnalyzing || !!feedback} className="bg-rust hover:bg-[#B8421E] text-white">
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            feedback ? "Done" : "Analyze Code"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

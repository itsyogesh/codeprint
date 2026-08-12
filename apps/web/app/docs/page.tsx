"use client"

import {
  AlertCircle,
  CheckCircle,
  Code2,
  Download,
  FileCode2,
  FileText,
  Info,
  Lightbulb,
  Monitor,
  Printer,
  Settings,
  Smartphone,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { HeroDescription, HeroHeading } from "@/components/marketing/hero-copy"
import NavHeader from "@/components/shared/nav-header"
import { SiteFooter } from "@/components/shared/site-footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview")

  const supportedLanguages = [
    { name: "JavaScript", ext: ".js, .jsx", icon: "🟨" },
    { name: "TypeScript", ext: ".ts, .tsx", icon: "🔷" },
    { name: "Python", ext: ".py", icon: "🐍" },
    { name: "Java", ext: ".java", icon: "☕" },
    { name: "C#", ext: ".cs", icon: "🔵" },
    { name: "C", ext: ".c, .h", icon: "Ⓒ" },
    { name: "C++", ext: ".cpp, .cc, .hpp", icon: "⚡" },
    { name: "Go", ext: ".go", icon: "🐹" },
    { name: "Rust", ext: ".rs", icon: "🦀" },
    { name: "PHP", ext: ".php", icon: "🐘" },
    { name: "Ruby", ext: ".rb", icon: "💎" },
    { name: "Swift", ext: ".swift", icon: "🍎" },
    { name: "Kotlin", ext: ".kt", icon: "🎯" },
    { name: "HTML", ext: ".html", icon: "🌐" },
    { name: "CSS", ext: ".css", icon: "🎨" },
    { name: "SQL", ext: ".sql", icon: "🗄️" },
    { name: "Shell/Bash", ext: ".sh, .bash", icon: "💻" },
    { name: "JSON", ext: ".json", icon: "📋" },
    { name: "R", ext: ".r, .R", icon: "📈" },
    { name: "Dart", ext: ".dart", icon: "🎯" },
    { name: "Scala", ext: ".scala, .sc", icon: "λ" },
    { name: "Markdown", ext: ".md, .markdown", icon: "📝", special: "Rendered" },
    { name: "CSV", ext: ".csv", icon: "📊", special: "Table Format" },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#030712] dark:text-slate-100">
      <NavHeader />
      {/* Header */}
      <main>
        <section className="border-b border-orange-500/20 bg-white pb-16 pt-32 dark:bg-[#030712]">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="mb-6 flex items-center justify-center">
                <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-3">
                  <FileText className="h-8 w-8 text-orange-500" />
                </div>
              </div>
              <HeroHeading className="mx-auto max-w-[20ch]">Learn Codeprint from paste to print.</HeroHeading>
              <HeroDescription className="mx-auto mt-6 max-w-2xl">
                Start with the editor, then fine-tune layouts, pagination, and output. Find language support and
                troubleshooting in one place.
              </HeroDescription>
              <div className="mt-8">
                <Link href="/">
                  <Button size="lg">Open the editor</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-8">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="languages">Languages</TabsTrigger>
                <TabsTrigger value="printing">Printing</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="troubleshooting">Help</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8">
                <div>
                  <Card className="p-8">
                    <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                      <Code2 className="h-8 w-8 text-orange-600" />
                      Getting Started
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-semibold mb-4">How It Works</h3>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-sm font-bold text-orange-600 dark:text-orange-400">
                              1
                            </div>
                            <div>
                              <p className="font-medium">Paste Your Code</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                Copy and paste your code into the editor
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-sm font-bold text-orange-600 dark:text-orange-400">
                              2
                            </div>
                            <div>
                              <p className="font-medium">Configure Settings</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                Choose language, font size, layout options
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-sm font-bold text-orange-600 dark:text-orange-400">
                              3
                            </div>
                            <div>
                              <p className="font-medium">Preview & Print</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                Review the formatted output and print or export
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-4">Key Features</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span>21 programming languages supported</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span>Beautiful syntax highlighting</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span>Customizable layouts and formatting</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span>PDF export functionality</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span>Mobile-friendly interface</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span>Dark mode support</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-8">
                    <h3 className="text-2xl font-bold mb-6">Quick Tips</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-3">
                          <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h4 className="font-semibold mb-2">Auto-Detection</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          File extensions automatically set the correct language
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-3">
                          <Monitor className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h4 className="font-semibold mb-2">Live Preview</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          See exactly how your code will look when printed
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center mx-auto mb-3">
                          <Settings className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h4 className="font-semibold mb-2">Customizable</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Adjust every aspect of the layout to your needs
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="languages" className="space-y-8">
                <div>
                  <Card className="p-8">
                    <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                      <FileCode2 className="h-8 w-8 text-orange-600" />
                      Supported Languages
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {supportedLanguages.map((lang) => (
                        <div
                          key={lang.name}
                          className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-orange-300 dark:hover:border-orange-600 transition-colors"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{lang.icon}</span>
                            <div>
                              <h3 className="font-semibold">{lang.name}</h3>
                              {lang.special && (
                                <Badge variant="secondary" className="text-xs">
                                  {lang.special}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{lang.ext}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                            Special Language Support
                          </h4>
                          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                            <li>
                              <strong>Markdown:</strong> Rendered with proper formatting, headings, lists, and styling
                            </li>
                            <li>
                              <strong>CSV:</strong> Displayed as formatted tables with headers and alternating row
                              colors
                            </li>
                            <li>
                              <strong>HTML:</strong> Syntax highlighted as XML for better readability
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="printing" className="space-y-8">
                <div>
                  <Card className="p-8">
                    <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                      <Printer className="h-8 w-8 text-orange-600" />
                      Printing Guide
                    </h2>

                    <div className="space-y-8">
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Browser Printing</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-3">Step-by-Step</h4>
                            <ol className="space-y-2 text-sm">
                              <li className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-xs font-bold text-orange-600 dark:text-orange-400">
                                  1
                                </span>
                                Click the "Print" button in the application
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-xs font-bold text-orange-600 dark:text-orange-400">
                                  2
                                </span>
                                Your browser's print dialog will open
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-xs font-bold text-orange-600 dark:text-orange-400">
                                  3
                                </span>
                                Adjust print settings if needed
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-xs font-bold text-orange-600 dark:text-orange-400">
                                  4
                                </span>
                                Click "Print" to send to your printer
                              </li>
                            </ol>
                          </div>
                          <div>
                            <h4 className="font-medium mb-3">Recommended Settings</h4>
                            <ul className="space-y-2 text-sm">
                              <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>
                                  <strong>Margins:</strong> Minimum or None
                                </span>
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>
                                  <strong>Background graphics:</strong> Enabled
                                </span>
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>
                                  <strong>Scale:</strong> 100%
                                </span>
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>
                                  <strong>Paper size:</strong> Match your selection
                                </span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-4">PDF Export</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-3">How to Export</h4>
                            <ol className="space-y-2 text-sm">
                              <li className="flex items-start gap-2">
                                <Download className="h-4 w-4 text-orange-600 mt-0.5" />
                                Click the "PDF" button
                              </li>
                              <li className="flex items-start gap-2">
                                <Download className="h-4 w-4 text-orange-600 mt-0.5" />
                                Wait for PDF generation
                              </li>
                              <li className="flex items-start gap-2">
                                <Download className="h-4 w-4 text-orange-600 mt-0.5" />
                                Download or share the PDF
                              </li>
                            </ol>
                          </div>
                          <div>
                            <h4 className="font-medium mb-3">PDF Benefits</h4>
                            <ul className="space-y-2 text-sm">
                              <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>Maintains all formatting</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>Perfect for sharing</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>Consistent across devices</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>Archival quality</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                              Print Quality Tips
                            </h4>
                            <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                              <li>• Use 12-14px font size for optimal readability</li>
                              <li>• Portrait orientation works best for most code</li>
                              <li>• Single column is recommended for narrow code</li>
                              <li>• Enable line numbers for easy reference during reviews</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-8">
                <div>
                  <Card className="p-8">
                    <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                      <Settings className="h-8 w-8 text-orange-600" />
                      Configuration Options
                    </h2>

                    <div className="space-y-8">
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Layout Settings</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Smartphone className="h-4 w-4" />
                                Page Orientation
                              </h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                Choose between portrait and landscape layouts
                              </p>
                              <div className="flex gap-2">
                                <Badge variant="outline">Portrait</Badge>
                                <Badge variant="outline">Landscape</Badge>
                              </div>
                            </div>

                            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                              <h4 className="font-medium mb-2">Font Size</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                Adjustable from 6px to 24px
                              </p>
                              <Badge variant="outline">6-24px range</Badge>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                              <h4 className="font-medium mb-2">Columns</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                Split code across 1-3 columns
                              </p>
                              <div className="flex gap-2">
                                <Badge variant="outline">1 Column</Badge>
                                <Badge variant="outline">2 Columns</Badge>
                                <Badge variant="outline">3 Columns</Badge>
                              </div>
                            </div>

                            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                              <h4 className="font-medium mb-2">Page Size</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Standard paper formats</p>
                              <div className="flex gap-2">
                                <Badge variant="outline">A4</Badge>
                                <Badge variant="outline">Letter</Badge>
                                <Badge variant="outline">Legal</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-4">Display Options</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg text-center">
                            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-3">
                              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h4 className="font-medium mb-2">Line Numbers</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Show/hide line numbers for easy reference
                            </p>
                          </div>

                          <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg text-center">
                            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-3">
                              <Code2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h4 className="font-medium mb-2">Syntax Highlighting</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Enable/disable color coding</p>
                          </div>

                          <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg text-center">
                            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center mx-auto mb-3">
                              <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h4 className="font-medium mb-2">Header Options</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Show filename on all pages or first only
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="troubleshooting" className="space-y-8">
                <div>
                  <Card className="p-8">
                    <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                      <AlertCircle className="h-8 w-8 text-orange-600" />
                      Troubleshooting
                    </h2>

                    <Accordion type="single" collapsible className="space-y-4">
                      <AccordionItem value="printing-issues">
                        <AccordionTrigger className="text-left">Code appears cut off when printing</AccordionTrigger>
                        <AccordionContent className="space-y-3">
                          <p>This usually happens due to browser print margins. Try these solutions:</p>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                              Set print margins to "Minimum" or "None" in your browser's print dialog
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                              Reduce font size to fit more content on the page
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                              Switch to landscape orientation for wider code
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                              Use single column layout instead of multi-column
                            </li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="syntax-highlighting">
                        <AccordionTrigger className="text-left">Syntax highlighting not working</AccordionTrigger>
                        <AccordionContent className="space-y-3">
                          <p>If your code isn't being highlighted properly:</p>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                              Ensure the selected language matches your code type
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                              Check that syntax highlighting is enabled in settings
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                              Some languages may take a moment to load on first use
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                              Try refreshing the page if highlighting seems stuck
                            </li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="pdf-generation">
                        <AccordionTrigger className="text-left">
                          PDF generation fails or takes too long
                        </AccordionTrigger>
                        <AccordionContent className="space-y-3">
                          <p>PDF generation issues can be resolved by:</p>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                              Reducing font size for complex or long code files
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                              Switching to single-column layout
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                              Closing other browser tabs to free up memory
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                              Breaking very large files into smaller chunks
                            </li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="preview-differences">
                        <AccordionTrigger className="text-left">
                          Preview looks different from printed output
                        </AccordionTrigger>
                        <AccordionContent className="space-y-3">
                          <p>This is normal behavior. Here's why:</p>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                              The preview is scaled to fit your screen size
                            </li>
                            <li className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                              Actual print output uses correct paper dimensions
                            </li>
                            <li className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                              Font rendering may vary between screen and print
                            </li>
                            <li className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                              Use PDF export for exact print preview
                            </li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="performance">
                        <AccordionTrigger className="text-left">
                          Application loads slowly or feels sluggish
                        </AccordionTrigger>
                        <AccordionContent className="space-y-3">
                          <p>Performance can be improved by:</p>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <Zap className="h-4 w-4 text-yellow-500 mt-0.5" />
                              Languages are loaded on-demand - first use may be slower
                            </li>
                            <li className="flex items-start gap-2">
                              <Zap className="h-4 w-4 text-yellow-500 mt-0.5" />
                              Use shorter code snippets for faster processing
                            </li>
                            <li className="flex items-start gap-2">
                              <Zap className="h-4 w-4 text-yellow-500 mt-0.5" />
                              Disable syntax highlighting for very large files
                            </li>
                            <li className="flex items-start gap-2">
                              <Zap className="h-4 w-4 text-yellow-500 mt-0.5" />
                              Close other browser tabs to free up resources
                            </li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </Card>

                  <Card className="p-8">
                    <h3 className="text-2xl font-bold mb-6">Browser Compatibility</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-green-700 dark:text-green-400">✅ Fully Supported</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Chrome/Chromium (Recommended)</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Microsoft Edge</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Firefox</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Safari (macOS/iOS)</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 text-yellow-700 dark:text-yellow-400">⚠️ Limited Support</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                            <span>Mobile browsers (Preview only)</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                            <span>Older browser versions</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-blue-500" />
                            <span>Printing may be limited on mobile</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-8 bg-gradient-to-r from-orange-50 to-orange-50 dark:from-orange-950 dark:to-orange-950">
                    <h3 className="text-2xl font-bold mb-4">Still Need Help?</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-6">
                      If you're still experiencing issues, here are additional resources:
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Button variant="outline" asChild>
                        <a
                          href="https://github.com/itsyogesh/codeprint/issues"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Report an Issue
                        </a>
                      </Button>
                      <Button variant="outline" asChild>
                        <a
                          href="https://github.com/itsyogesh/codeprint/discussions"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Community Discussions
                        </a>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/">Back to App</Link>
                      </Button>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function PersonaManagePage() {
    const [personas, setPersonas] = useState<{
        name: string;
        description: string | null;
        system_prompt: string;
        model_used: string;
        api_key_id: string;
    }[]>([]);

    const [newPersona, setNewPersona] = useState({
        name: "",
        description: "",
        system_prompt: "",
        model_used: "Gemini-2.0-flash",
        api_key_id: ""
    });


    const roles = [
        {
            name: "Note-Taking Assistant",
            description: "Handles customer queries and support.",
            system_prompt: "You are a helpful customer support agent.",
            model_used: "Gemini-2.0-flash",
            api_key_id: "default-support"
        },
        {
            name: "Content Writer",
            description: "Creates engaging blog posts.",
            system_prompt: "You are a creative content writer.",
            model_used: "Gemini-2.0-pro",
            api_key_id: "default-writer"
        },
        {
            name: "Code Assistant",
            description: "Helps with programming questions.",
            system_prompt: "You are an expert programming assistant.",
            model_used: "Gemini-2.5-flash",
            api_key_id: "default-coder"
        }
    ];

    const [roleDialogIdx, setRoleDialogIdx] = useState<number | null>(null);

    const handleAdd = () => {
        if (!newPersona.name.trim() || !newPersona.system_prompt.trim() || !newPersona.model_used.trim() || !newPersona.api_key_id.trim()) return;
        setPersonas([
            ...personas,
            {
                name: newPersona.name.trim(),
                description: newPersona.description.trim() ? newPersona.description.trim() : null,
                system_prompt: newPersona.system_prompt.trim(),
                model_used: newPersona.model_used.trim(),
                api_key_id: newPersona.api_key_id.trim()
            }
        ]);
        setNewPersona({ name: "", description: "", system_prompt: "", model_used: "", api_key_id: "" });
    };

    const handleRemove = (idx: number) => {
        setPersonas(personas.filter((_, i) => i !== idx));
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Persona Management</h1>
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Add Persona</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Default Persona Options: Each role as a Button, Dialog shows info */}
                    <div className="mb-4">
                        <div className="font-semibold mb-2">Quick Fill Default Personas:</div>
                        <div className="flex flex-wrap gap-2">
                            {roles.map((persona, idx) => (
                                <Dialog key={idx} open={roleDialogIdx === idx} onOpenChange={open => setRoleDialogIdx(open ? idx : null)}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">{persona.name}</Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-lg">
                                        <DialogHeader>
                                            <DialogTitle>{persona.name}</DialogTitle>
                                        </DialogHeader>
                                        <div className="mb-2 text-sm text-muted-foreground">{persona.description}</div>

                                        <div className="grid gap-4">
                                            <div className="grid gap-3">
                                                <Label htmlFor="name-1">System Prompt</Label>
                                                <div className="p-2 bg-muted rounded font-mono">{persona.system_prompt}</div>
                                            </div>
                                            <div className="grid gap-3">
                                                <Label htmlFor="username-1">Model</Label>
                                                <div className="p-2 bg-muted rounded">{persona.model_used}</div>
                                            </div>
                                            <div className="grid gap-3">
                                                <Label htmlFor="username-1">API Key ID</Label>
                                                <div className="p-2 bg-muted rounded font-mono">{persona.api_key_id}</div>
                                            </div>
                                        </div>
                                        <DialogFooter className="flex gap-2">
                                            <Button
                                                onClick={() => {
                                                    setNewPersona({ ...persona });
                                                    setRoleDialogIdx(null);
                                                }}
                                            >Apply</Button>
                                            <Button variant="outline" onClick={() => setRoleDialogIdx(null)}>Cancel</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            ))}
                        </div>
                    </div>

                    {/* Custom Add Persona Form */}
                    <div className="font-semibold mb-2">Add Custom Persona:</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Input
                            placeholder="Persona Role"
                            value={newPersona.name}
                            onChange={e => setNewPersona({ ...newPersona, name: e.target.value })}
                        />
                        <Input
                            placeholder="Description (optional)"
                            value={newPersona.description}
                            onChange={e => setNewPersona({ ...newPersona, description: e.target.value })}
                        />
                    </div>
                    <Textarea
                        placeholder="System Prompt"
                        value={newPersona.system_prompt}
                        onChange={e => setNewPersona({ ...newPersona, system_prompt: e.target.value })}
                        className="mb-4"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Select value={newPersona.model_used} onValueChange={value => setNewPersona({ ...newPersona, model_used: value })}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Gemini-2.0-flash">Gemini-2.0-flash</SelectItem>
                                <SelectItem value="Gemini-2.0-pro">Gemini-2.0-pro</SelectItem>
                                <SelectItem value="Gemini-2.5-flash">Gemini-2.5-flash</SelectItem>
                                <SelectItem value="Gemini-2.5-pro">Gemini-2.5-pro</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="API Key ID"
                            value={newPersona.api_key_id}
                            onChange={e => setNewPersona({ ...newPersona, api_key_id: e.target.value })}
                        />
                    </div>
                    <Button
                        onClick={handleAdd}
                        disabled={
                            !newPersona.name.trim() ||
                            !newPersona.system_prompt.trim() ||
                            !newPersona.model_used.trim() ||
                            !newPersona.api_key_id.trim()
                        }
                    >
                        Add Persona
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Personas List</CardTitle>
                </CardHeader>
                <CardContent>
                    {personas.length === 0 ? (
                        <div className="text-muted-foreground">No personas.</div>
                    ) : (
                        <div className="space-y-4">
                            {personas.map((persona, idx) => (
                                <Card key={idx} className="bg-background">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-lg">{persona.name}</span>
                                            <Button variant="destructive" size="sm" onClick={() => handleRemove(idx)}>
                                                Delete
                                            </Button>
                                        </div>
                                        <div className="text-sm text-muted-foreground mb-1">Description: {persona.description ?? <span className="italic">NULL</span>}</div>
                                        <div className="text-sm text-muted-foreground mb-1">System Prompt: <span className="font-mono">{persona.system_prompt}</span></div>
                                        <div className="text-sm text-muted-foreground mb-1">Model Used: <span className="font-semibold">{persona.model_used}</span></div>
                                        <div className="text-sm text-muted-foreground">API Key ID: <span className="font-mono">{persona.api_key_id}</span></div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

"use client";

import React, { useCallback, useEffect, useState } from "react";
import { IconCheck, IconCopy, IconRefresh } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import { DialogClose, DialogFooter } from "@repo/ui/components/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@repo/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@repo/ui/components/input-group";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { cn } from "@repo/ui/lib/utils";

// --- Constants & Word List ---

const AMBIGUOUS_CHARS = "Il1O0";
const CHAR_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  special: "!@#$%^&*",
};

const COMMON_WORDS = [
  "abandon",
  "ability",
  "able",
  "about",
  "above",
  "absent",
  "absorb",
  "abstract",
  "absurd",
  "abuse",
  "access",
  "accident",
  "account",
  "accuse",
  "achieve",
  "acid",
  "acoustic",
  "acquire",
  "across",
  "act",
  "action",
  "actor",
  "actress",
  "actual",
  "adapt",
  "add",
  "addict",
  "address",
  "adjust",
  "admit",
  "adult",
  "advance",
  "advice",
  "aerobic",
  "affair",
  "afford",
  "afraid",
  "again",
  "age",
  "agent",
  "agree",
  "ahead",
  "aim",
  "air",
  "airport",
  "aisle",
  "alarm",
  "album",
  "alcohol",
  "alert",
  "alien",
  "all",
  "alley",
  "allow",
  "almost",
  "alone",
  "alpha",
  "already",
  "also",
  "alter",
  "always",
  "amateur",
  "amazing",
  "among",
  "amount",
  "amused",
  "analyst",
  "anchor",
  "ancient",
  "anger",
  "angle",
  "angry",
  "animal",
  "ankle",
  "announce",
  "annual",
  "another",
  "answer",
  "antenna",
  "antique",
  "anxiety",
  "any",
  "apart",
  "apology",
  "appear",
  "apple",
  "approve",
  "april",
  "arch",
  "arctic",
  "area",
  "arena",
  "argue",
  "arm",
  "armed",
  "armor",
  "army",
  "around",
  "arrange",
  "arrest",
  "arrive",
  "arrow",
  "art",
  "artefact",
  "artist",
  "artwork",
  "ask",
  "aspect",
  "assault",
  "asset",
  "assist",
  "assume",
  "asthma",
  "athlete",
  "atom",
  "attack",
  "attend",
  "attitude",
  "attract",
  "auction",
  "audit",
  "august",
  "aunt",
  "author",
  "auto",
  "autumn",
  "average",
  "avocado",
  "avoid",
  "awake",
  "aware",
  "away",
  "awesome",
  "awful",
  "awkward",
  "axis",
  "baby",
  "bachelor",
  "bacon",
  "badge",
  "bag",
  "balance",
  "balcony",
  "ball",
  "bamboo",
  "banana",
  "banner",
  "bar",
  "barely",
  "bargain",
  "barrel",
  "barrier",
  "base",
  "basic",
  "basket",
  "battle",
  "beach",
  "beam",
  "bean",
  "beauty",
  "because",
  "become",
  "beef",
  "before",
  "begin",
  "behave",
  "behind",
  "believe",
  "below",
  "belt",
  "bench",
  "benefit",
  "best",
  "betray",
  "better",
  "between",
  "beyond",
  "bicycle",
  "bid",
  "bike",
  "bind",
  "biology",
  "bird",
  "birth",
  "bitter",
  "black",
  "blade",
  "blame",
  "blanket",
  "blast",
  "bleak",
  "bless",
  "blind",
  "blood",
  "blossom",
  "blouse",
  "blue",
  "blur",
  "blush",
  "board",
  "boat",
  "body",
  "boil",
  "bomb",
  "bone",
  "bonus",
  "book",
  "boost",
  "border",
  "boring",
  "borrow",
  "boss",
  "bottom",
  "bounce",
  "box",
  "boy",
  "bracket",
  "brain",
  "brand",
  "brass",
  "brave",
  "bread",
  "breeze",
  "brick",
  "bridge",
  "brief",
  "bright",
  "bring",
  "brisk",
  "broccoli",
  "broken",
  "bronze",
  "broom",
  "brother",
  "brown",
  "brush",
  "bubble",
  "buddy",
  "budget",
  "buffalo",
  "build",
  "bulb",
  "bulk",
  "bullet",
  "bundle",
  "bunker",
  "burden",
  "burger",
  "burst",
  "bus",
  "business",
  "busy",
  "butter",
  "buyer",
  "buzz",
  "cabbage",
  "cabin",
  "cable",
  "cactus",
  "cage",
  "cake",
  "call",
  "calm",
  "camera",
  "camp",
  "can",
  "canal",
  "cancel",
  "candy",
  "cannon",
  "canoe",
  "canvas",
  "canyon",
  "capable",
  "capital",
  "captain",
  "caption",
  "car",
  "carbon",
  "card",
  "cargo",
  "carpet",
  "carry",
  "cart",
  "case",
  "cash",
  "casino",
  "castle",
  "casual",
  "cat",
  "catalog",
  "catch",
  "category",
  "cattle",
  "caught",
  "cause",
  "caution",
  "cave",
  "ceiling",
  "celery",
  "cement",
  "census",
  "century",
  "cereal",
  "certain",
  "chair",
  "chalk",
  "champion",
  "change",
  "chaos",
  "chapter",
  "charge",
  "chase",
  "chat",
  "cheap",
  "check",
  "cheese",
  "chef",
  "cherry",
  "chest",
  "chicken",
  "chief",
  "child",
  "chimney",
  "choice",
  "choose",
  "chronic",
  "chuckle",
  "chunk",
  "churn",
  "cider",
  "cigarette",
  "cinema",
  "circle",
  "citizen",
  "city",
  "civil",
  "claim",
  "clap",
  "clarify",
  "claw",
  "clay",
  "clean",
  "clerk",
  "clever",
  "click",
  "client",
  "cliff",
  "climb",
  "clinic",
  "clip",
  "clock",
  "clog",
  "close",
  "cloth",
  "cloud",
  "clown",
  "club",
  "clump",
  "cluster",
  "clutch",
  "coach",
  "coast",
  "coconut",
  "code",
  "coffee",
  "coil",
  "coin",
  "collect",
  "color",
  "column",
  "combine",
  "come",
  "comfort",
  "comic",
  "common",
  "company",
  "compass",
  "complete",
  "confirm",
  "conga",
  "congo",
  "conic",
  "conifer",
  "conjure",
  "connect",
  "conquer",
  "conrad",
  "conserve",
  "consist",
];

// --- Schemas ---

const PasswordOptionsSchema = z.object({
  type: z.enum(["password", "passphrase"]),
  // Password options
  length: z.number().min(5).max(128).default(14),
  includeUppercase: z.boolean().default(true),
  includeLowercase: z.boolean().default(true),
  includeNumbers: z.boolean().default(true),
  includeSpecial: z.boolean().default(false),
  minNumbers: z.number().min(0).default(1),
  minSpecial: z.number().min(0).default(0),
  avoidAmbiguous: z.boolean().default(false),
  // Passphrase options
  wordCount: z.number().min(3).max(20).default(4),
  separator: z.string().default("-"),
  capitalize: z.boolean().default(false),
  includeNumber: z.boolean().default(false),
});

type PasswordOptions = z.infer<typeof PasswordOptionsSchema>;

interface PasswordGeneratorFormProps {
  onUsePassword?: (password: string) => void;
}

// SideEffectTrigger defined outside for stable reference
const SideEffectTrigger = React.memo(
  ({
    values,
    onValuesChange,
  }: {
    values: PasswordOptions;
    onValuesChange: (v: PasswordOptions) => void;
  }) => {
    useEffect(() => {
      onValuesChange(values);
    }, [values, onValuesChange]);
    return null;
  },
);

SideEffectTrigger.displayName = "SideEffectTrigger";

const PasswordGeneratorForm = ({
  onUsePassword,
}: PasswordGeneratorFormProps) => {
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const form = useForm({
    defaultValues: {
      type: "password" as "password" | "passphrase",
      length: 14,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSpecial: false,
      minNumbers: 1,
      minSpecial: 0,
      avoidAmbiguous: false,
      wordCount: 4,
      separator: "-",
      capitalize: false,
      includeNumber: false,
    },
    validators: {
      onChange: ({ value }) => {
        const result = PasswordOptionsSchema.safeParse(value);
        console.log(result);
        if (!result.success) {
          return result.error.message;
        }
        return undefined;
      },
    },
  });

  const generate = useCallback((options: PasswordOptions) => {
    let result = "";
    if (options.type === "password") {
      let pool = "";
      if (options.includeUppercase) pool += CHAR_SETS.uppercase;
      if (options.includeLowercase) pool += CHAR_SETS.lowercase;
      if (options.includeNumbers) pool += CHAR_SETS.numbers;
      if (options.includeSpecial) pool += CHAR_SETS.special;

      if (options.avoidAmbiguous) {
        const regex = new RegExp(`[${AMBIGUOUS_CHARS}]`, "g");
        pool = pool.replace(regex, "");
      }

      if (pool.length === 0) {
        setGeneratedPassword("");
        return;
      }

      const getRandomChar = (source: string) => {
        if (source.length === 0) return "";
        if (typeof window === "undefined" || !window.crypto) return "";
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        const val = array[0];
        if (val === undefined) return "";
        return source[val % source.length] || "";
      };

      const chars: string[] = [];

      // Ensure minimums
      let guaranteedCount = 0;
      if (options.includeNumbers && options.minNumbers > 0) {
        const numPool = options.avoidAmbiguous
          ? CHAR_SETS.numbers.replace(/[0]/g, "")
          : CHAR_SETS.numbers;
        for (let i = 0; i < options.minNumbers; i++) {
          const char = getRandomChar(numPool);
          if (char) {
            chars.push(char);
            guaranteedCount++;
          }
        }
      }
      if (options.includeSpecial && options.minSpecial > 0) {
        for (let i = 0; i < options.minSpecial; i++) {
          const char = getRandomChar(CHAR_SETS.special);
          if (char) {
            chars.push(char);
            guaranteedCount++;
          }
        }
      }

      // Fill remaining
      const remaining = Math.max(0, options.length - guaranteedCount);
      for (let i = 0; i < remaining; i++) {
        const char = getRandomChar(pool);
        if (char) chars.push(char);
      }

      // Shuffle
      for (let i = chars.length - 1; i > 0; i--) {
        if (typeof window === "undefined" || !window.crypto) break;
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        const val = array[0];
        if (val !== undefined) {
          const j = val % (i + 1);
          const temp = chars[i];
          const target = chars[j];
          if (temp !== undefined && target !== undefined) {
            chars[i] = target;
            chars[j] = temp;
          }
        }
      }

      result = chars.join("");
    } else {
      // Passphrase mode
      const words: string[] = [];
      const numWords = options.wordCount;

      for (let i = 0; i < numWords; i++) {
        if (typeof window === "undefined" || !window.crypto) break;
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        const val = array[0];
        if (val !== undefined) {
          const wordIdx = val % COMMON_WORDS.length;
          let word = COMMON_WORDS[wordIdx];
          if (!word) word = "vault"; // fallback

          if (options.capitalize) {
            word = word.charAt(0).toUpperCase() + word.slice(1);
          }
          words.push(word);
        }
      }

      result = words.join(options.separator);

      if (options.includeNumber) {
        if (typeof window !== "undefined" && window.crypto) {
          const array = new Uint32Array(1);
          window.crypto.getRandomValues(array);
          const val = array[0];
          if (val !== undefined) {
            result += (val % 10).toString();
          }
        }
      }
    }
    setGeneratedPassword(result);
  }, []);

  const copyToClipboard = () => {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <form.Subscribe
      selector={(state) => state.values}
      children={(formValues) => (
        <div className="flex flex-col gap-6">
          <SideEffectTrigger
            values={formValues as any}
            onValuesChange={generate}
          />
          <Tabs
            value={formValues.type}
            onValueChange={(val) => form.setFieldValue("type", val as any)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="passphrase">Passphrase</TabsTrigger>
            </TabsList>

            <div className="mt-6 flex flex-col gap-6">
              {/* Preview Box */}
              <div className="bg-muted/50 relative flex min-h-16 w-full items-center justify-between rounded-lg border p-4">
                <div className="font-mono text-lg font-medium tracking-tight break-all">
                  {generatedPassword.split("").map((char, i) => (
                    <span
                      key={i}
                      className={cn(
                        CHAR_SETS.numbers.includes(char) && "text-blue-500",
                        CHAR_SETS.special.includes(char) && "text-blue-400",
                        AMBIGUOUS_CHARS.includes(char) &&
                          "bg-yellow-500/10 text-yellow-500",
                      )}
                    >
                      {char}
                    </span>
                  ))}
                </div>
                <div className="ml-4 flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => generate(formValues as any)}
                    type="button"
                    title="Regenerate"
                  >
                    <IconRefresh className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={copyToClipboard}
                    type="button"
                    title="Copy"
                  >
                    {copied ? (
                      <IconCheck className="size-4 text-green-500" />
                    ) : (
                      <IconCopy className="size-4" />
                    )}
                  </Button>
                </div>
              </div>

              <TabsContent
                value="password"
                className="mt-0 flex flex-col gap-6"
              >
                <div className="flex flex-col gap-4">
                  <h3 className="text-muted-foreground/70 text-sm font-semibold tracking-wider uppercase">
                    Options
                  </h3>
                  <div className="bg-muted/20 rounded-lg border p-4">
                    <form.Field
                      name="length"
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid;

                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel>Length</FieldLabel>
                            <InputGroup>
                              <InputGroupInput
                                type="number"
                                value={field.state.value}
                                onChange={(e) =>
                                  field.handleChange(Number(e.target.value))
                                }
                                min={5}
                                max={128}
                                className="h-10 text-lg"
                              />
                            </InputGroup>
                            <FieldDescription className="mt-2 text-xs leading-relaxed">
                              Value must be between 5 and 128. Use 14 characters
                              or more to generate a strong password.
                            </FieldDescription>
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        );
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="bg-muted/20 rounded-lg border p-4">
                    <h4 className="mb-4 text-sm font-semibold">Include</h4>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <form.Field
                        name="includeUppercase"
                        children={(field) => (
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="upper"
                              checked={field.state.value}
                              onCheckedChange={(checked) =>
                                field.handleChange(!!checked)
                              }
                            />
                            <label
                              htmlFor="upper"
                              className="text-sm font-medium"
                            >
                              A-Z
                            </label>
                          </div>
                        )}
                      />
                      <form.Field
                        name="includeLowercase"
                        children={(field) => (
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="lower"
                              checked={field.state.value}
                              onCheckedChange={(checked) =>
                                field.handleChange(!!checked)
                              }
                            />
                            <label
                              htmlFor="lower"
                              className="text-sm font-medium"
                            >
                              a-z
                            </label>
                          </div>
                        )}
                      />
                      <form.Field
                        name="includeNumbers"
                        children={(field) => (
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="nums"
                              checked={field.state.value}
                              onCheckedChange={(checked) =>
                                field.handleChange(!!checked)
                              }
                            />
                            <label
                              htmlFor="nums"
                              className="text-sm font-medium"
                            >
                              0-9
                            </label>
                          </div>
                        )}
                      />
                      <form.Field
                        name="includeSpecial"
                        children={(field) => (
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="spec"
                              checked={field.state.value}
                              onCheckedChange={(checked) =>
                                field.handleChange(!!checked)
                              }
                            />
                            <label
                              htmlFor="spec"
                              className="text-sm font-medium"
                            >
                              !@#$%^&*
                            </label>
                          </div>
                        )}
                      />
                    </div>

                    <div className="relative mt-6 grid grid-cols-2 gap-4">
                      <form.Field
                        name="minNumbers"
                        children={(field) => (
                          <Field>
                            <FieldLabel>Minimum numbers</FieldLabel>
                            <InputGroup>
                              <InputGroupInput
                                type="number"
                                value={field.state.value}
                                onChange={(e) =>
                                  field.handleChange(Number(e.target.value))
                                }
                                min={0}
                                max={formValues.length}
                              />
                            </InputGroup>
                          </Field>
                        )}
                      />
                      <form.Field
                        name="minSpecial"
                        children={(field) => (
                          <Field>
                            <FieldLabel>Minimum special</FieldLabel>
                            <InputGroup>
                              <InputGroupInput
                                type="number"
                                value={field.state.value}
                                onChange={(e) =>
                                  field.handleChange(Number(e.target.value))
                                }
                                min={0}
                                max={formValues.length}
                              />
                            </InputGroup>
                          </Field>
                        )}
                      />
                    </div>

                    <form.Field
                      name="avoidAmbiguous"
                      children={(field) => (
                        <div className="mt-6 flex items-center gap-2">
                          <Checkbox
                            id="ambig"
                            checked={field.state.value}
                            onCheckedChange={(checked) =>
                              field.handleChange(!!checked)
                            }
                          />
                          <label
                            htmlFor="ambig"
                            className="text-sm font-medium"
                          >
                            Avoid ambiguous characters
                          </label>
                        </div>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="passphrase"
                className="mt-0 flex flex-col gap-6"
              >
                <div className="bg-muted/20 flex flex-col gap-6 rounded-lg border p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <form.Field
                      name="wordCount"
                      children={(field) => (
                        <Field>
                          <FieldLabel>Number of words</FieldLabel>
                          <InputGroup>
                            <InputGroupInput
                              type="number"
                              value={field.state.value}
                              onChange={(e) =>
                                field.handleChange(Number(e.target.value))
                              }
                              min={3}
                              max={20}
                            />
                          </InputGroup>
                        </Field>
                      )}
                    />
                    <form.Field
                      name="separator"
                      children={(field) => (
                        <Field>
                          <FieldLabel>Word separator</FieldLabel>
                          <InputGroup>
                            <InputGroupInput
                              value={field.state.value}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              maxLength={1}
                            />
                          </InputGroup>
                        </Field>
                      )}
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    <form.Field
                      name="capitalize"
                      children={(field) => (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="cap"
                            checked={field.state.value}
                            onCheckedChange={(checked) =>
                              field.handleChange(!!checked)
                            }
                          />
                          <label htmlFor="cap" className="text-sm font-medium">
                            Capitalize
                          </label>
                        </div>
                      )}
                    />
                    <form.Field
                      name="includeNumber"
                      children={(field) => (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="incNum"
                            checked={field.state.value}
                            onCheckedChange={(checked) =>
                              field.handleChange(!!checked)
                            }
                          />
                          <label
                            htmlFor="incNum"
                            className="text-sm font-medium"
                          >
                            Include number
                          </label>
                        </div>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>
            </div>

            <DialogFooter className="mt-2 sm:justify-start">
              <DialogClose asChild>
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={() => onUsePassword?.(generatedPassword)}
                >
                  Use this password
                </Button>
              </DialogClose>
            </DialogFooter>
          </Tabs>
        </div>
      )}
    />
  );
};

export default PasswordGeneratorForm;

"use client";

import React, { useState } from 'react'
import { useForm } from '@tanstack/react-form';
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react"

import { calculatePasswordStrength } from '@/lib/utils';

import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@repo/ui/components/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@repo/ui/components/input-group";
import { Button } from "@repo/ui/components/button";
import { Progress } from "@repo/ui/components/progress";
import { cn } from '@repo/ui/lib/utils';

const SignUpForm = () => {
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm({
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
        onSubmit: async (data) => {
            console.log(data);
        },
    });
    
  return (
    <form onSubmit={(event) => {
      event.preventDefault();
      void form.handleSubmit();
    }}>
      <FieldGroup>
      <form.Field
        name="email"
        children={(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <Field data-invalid={isInvalid}>
              <FieldContent>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              </FieldContent>

              <InputGroup>
                <InputGroupInput
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e)=>field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={isInvalid}
                  placeholder="Enter your email"
                  className="h-11 rounded-full"
                />
                  
                <InputGroupAddon>
                  <MailIcon/>
                </InputGroupAddon>
              </InputGroup>
              {isInvalid && <FieldError errors={field.state.meta.errors}/>}
            </Field>
          )
        }}
      />

      <form.Field
        name="password"
        validators={{
            onChange: ({ value }) => {
                console.log(value);
                if (!value) return 'Password is required';
                const strength = calculatePasswordStrength(value);
                if (strength.score < 50) {
                  return 'Password is too weak';
                }
                return "Strong";
            }
        }}
        children={(field) => {
        
            const strength = calculatePasswordStrength(field.state.value);

          return (
            <Field>
              <FieldContent>
                <FieldLabel htmlFor={field.name}>Master Password</FieldLabel>
              </FieldContent>

              <InputGroup>
                <InputGroupInput
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e)=>field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your master password"
                  className="h-11 rounded-full"
                />

                <InputGroupAddon>
                  <LockIcon/>
                </InputGroupAddon>
                <InputGroupAddon align="inline-end">
                  <InputGroupButton variant={"ghost"} size={"icon-sm"} onClick={() => setShowPassword(!showPassword)}>
                    {!showPassword ? <EyeIcon/> : <EyeOffIcon/>}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>

                  <Progress value={strength.score} />
                  
              {field.state.meta.errors && <p className={`text-[${strength.color}]`}>{field.state.meta.errors}</p>}

            </Field>
          )
        }}
      />
      <Button type="submit">Sign Up</Button>
    </FieldGroup>
    </form>
  )
}

export default SignUpForm
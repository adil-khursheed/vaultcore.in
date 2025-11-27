"use client";

import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { EyeIcon, EyeOffIcon, Loader2Icon, LockIcon, MailIcon, UserIcon } from "lucide-react"

import { calculatePasswordStrength } from '@/lib/utils';

import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@repo/ui/components/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@repo/ui/components/input-group";
import { Button } from "@repo/ui/components/button";
import { Progress } from "@repo/ui/components/progress";
import { authClient } from '@/lib/auth/client';
import { toast } from 'sonner';
import {z} from 'zod/v4';

export const SignUpSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  email: z.email("Invalid email address"),
  password: z.string().min(12, "Password must be at least 12 characters long").max(128, "Password must be at most 128 characters long"),
})

const SignUpForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();

    const form = useForm({
      defaultValues: {
          name: "",
          email: "",
          password: "",
      },
      validators: {
        onSubmit:SignUpSchema
      },
      onSubmit: async (data) => {
        const { data: res, error } = await authClient.signUp.email({
          email: data.value.email,
          password: data.value.password,
          name: data.value.name,
          callbackURL: "/verify",
        });
        if (error) {
          console.log(error);
          toast.error(error.message);
          return;
        }

        if(res && res.user){
          toast.success("User created successfully");
          router.replace("/verify");
        }
      },
    });
    
  return (
    <form onSubmit={(event) => {
      event.preventDefault();
      void form.handleSubmit();
    }}>
      <FieldGroup>
      <form.Field
        name="name"
        children={(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

          return (
            <Field data-invalid={isInvalid}>
              <FieldContent>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
              </FieldContent>

              <InputGroup>
                <InputGroupInput
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e)=>field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  aria-invalid={isInvalid}
                  placeholder="Enter your name"
                  className="h-11 rounded-full"
                />
                  
                <InputGroupAddon>
                  <UserIcon/>
                </InputGroupAddon>
              </InputGroup>
              {isInvalid && <FieldError errors={field.state.meta.errors}/>}
            </Field>
          )
        }}
      />

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
        listeners={{
          onChange: ({ value }) => {
            if (!value) return 'Password is required';
            const strength = calculatePasswordStrength(value);
            if (strength.score < 50) {
              return 'Password is too weak';
            }
            return undefined;
          }
        }}
          children={(field) => {
          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

          const strength = calculatePasswordStrength(field.state.value);

          return (
            <Field data-invalid={isInvalid}>
              <FieldContent>
                <FieldLabel htmlFor={field.name} className={`text-[${strength.color}]`}>Master Password</FieldLabel>
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
                  aria-invalid={isInvalid}
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

              <Progress
                value={strength.score}
                data-level={strength.level}
                indicatorStyle={{ backgroundColor: strength.color }}
              />
                  
              {isInvalid && <FieldError errors={field.state.meta.errors}/>}
            </Field>
          )
        }}
      />
        
      <form.Subscribe
        selector={(state)=>[state.canSubmit,state.isSubmitting]}
        children={([canSubmit,isSubmitting])=>{
          return (
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
             {isSubmitting ? <Loader2Icon className="animate-spin"/> :"Sign Up"}
            </Button>
          )
        }}
      />
    </FieldGroup>
    </form>
  )
}

export default SignUpForm
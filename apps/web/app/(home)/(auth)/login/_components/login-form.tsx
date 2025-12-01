"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { useForm } from "@tanstack/react-form";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@repo/ui/components/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@repo/ui/components/input-group";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async (data) => {
      const { data: res, error } = await authClient.signIn.email({
        email: data.value.email,
        password: data.value.password,
        callbackURL: "/dashboard",
      });

      if (error) {
        console.log(error);
        toast.error(error.message);
        return;
      }

      if (res && res.url) {
        router.replace(res.url);
      }
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field
          name="email"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

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
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={isInvalid}
                    placeholder="Enter your email"
                    className="h-11 rounded-full"
                  />

                  <InputGroupAddon>
                    <MailIcon />
                  </InputGroupAddon>
                </InputGroup>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="password"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldContent>
                  <FieldLabel htmlFor={field.name}>Master Password</FieldLabel>
                </FieldContent>

                <InputGroup>
                  <InputGroupInput
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={isInvalid}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your master password"
                    className="h-11 rounded-full"
                  />

                  <InputGroupAddon>
                    <LockIcon />
                  </InputGroupAddon>
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      variant={"ghost"}
                      size={"icon-sm"}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {!showPassword ? <EyeIcon /> : <EyeOffIcon />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
        <Button type="submit">Login</Button>
      </FieldGroup>
    </form>
  );
};

export default LoginForm;

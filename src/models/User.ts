import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  phoneNumber?: string;
  phoneVerified: boolean;
  lastLogin?: Date;
  profileImage?: string;
  tenantId?: string;
  handle?: string;
  subscriptionStatus: 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing';
  stripeCustomerId?: string;
  settings: {
    theme: 'light' | 'dark' | 'system';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    twoFactorEnabled: boolean;
    twoFactorMethod?: 'app' | 'sms' | 'email';
  };
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'developer', 'support'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneNumber: {
      type: String,
      default: null,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    profileImage: {
      type: String,
      default: null,
    },
    tenantId: {
      type: String,
      default: null,
    },
    handle: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'inactive', 'past_due', 'canceled', 'trialing'],
      default: 'inactive',
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    settings: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        push: {
          type: Boolean,
          default: true,
        },
        sms: {
          type: Boolean,
          default: false,
        },
      },
      twoFactorEnabled: {
        type: Boolean,
        default: false,
      },
      twoFactorMethod: {
        type: String,
        enum: ['app', 'sms', 'email'],
        default: null,
      },
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Hash the password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create indexes
userSchema.index({ email: 1 });
userSchema.index({ handle: 1 }, { sparse: true });
userSchema.index({ tenantId: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
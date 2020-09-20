from django.db import models
from django.core.mail import send_mail
from django.contrib.auth.models import PermissionsMixin, UserManager
from django.contrib.auth.base_user import AbstractBaseUser
from django.utils.translation import ugettext_lazy as _
from django.utils import timezone

class CustomUserManager(UserManager):
    """ユーザーマネージャー"""
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('The given email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self._create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    """カスタムユーザーモデル."""

    email = models.EmailField(_('email address'), unique=True)

    is_staff = models.BooleanField(
        _('staff status'),
        default=False,
        help_text=_(
            'Designates whether the user can log into this admin site.'),
    )
    is_active = models.BooleanField(
        _('active'),
        default=True,
        help_text=_(
            'Designates whether this user should be treated as active. '
            'Unselect this instead of deleting accounts.'
        ),
    )
    date_joined = models.DateTimeField(_('date joined'), default=timezone.now)

    objects = CustomUserManager()

    EMAIL_FIELD = 'email'
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')

    def email_user(self, subject, message, from_email=None, **kwargs):
        """Send an email to this user."""
        send_mail(subject, message, from_email, [self.email], **kwargs)

    @property
    def username(self):
        """username属性のゲッター

        他アプリケーションが、username属性にアクセスした場合に備えて定義
        メールアドレスを返す
        """
        return self.email

class Verify(models.Model):
    """ This model for User activation code """
    user = models.OneToOneField('sqp.User', related_name='verify', on_delete=models.CASCADE)
    code = models.CharField(max_length=50)

class Product(models.Model):
    """ This model for Product """
    price = models.IntegerField()
    image = models.CharField(max_length=100)
    title = models.CharField(max_length=100)
    desc = models.CharField(max_length=100)

class UserProduct(models.Model):
    """ Count buy product and purchase price (When ordering) """
    user = models.ForeignKey('sqp.User', related_name='userproducts', on_delete=models.CASCADE)
    product = models.ForeignKey('sqp.Product', on_delete=models.CASCADE)
    count = models.IntegerField()
    price = models.IntegerField()

class Pay(models.Model):
    """ payment status """
    user = models.OneToOneField('sqp.User', related_name='pay', on_delete=models.CASCADE)
    token = models.CharField(max_length=100)
    code = models.CharField(max_length=50)
    receive = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)
"""empty message

Revision ID: 0d917e6908da
Revises: 1065b18dfd4c
Create Date: 2019-08-28 18:42:25.938206

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.ext.declarative import declarative_base

from slugify import slugify


Base = declarative_base()

# revision identifiers, used by Alembic.
revision = '0d917e6908da'
down_revision = '1065b18dfd4c'
branch_labels = None
depends_on = None


# bare-bones subset of app.Explainer that we need for this migration
class Explainer(Base):
    __tablename__ = "explainer"

    id = sa.Column(sa.Integer, primary_key=True)
    question = sa.Column(sa.Text, nullable=False, unique=True)
    slug = sa.Column(sa.Text, nullable=True)


def upgrade():
    bind = op.get_bind()
    session = sa.orm.Session(bind=bind)

    # set explainer slug based on question
    for explainer in session.query(Explainer):
        explainer.slug = slugify(explainer.question)

    session.commit()


def downgrade():
    pass
